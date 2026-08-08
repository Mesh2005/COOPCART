import "server-only";

/**
 * Provider-agnostic text generation for CoopCart's AI features (support chat +
 * report insights). Tries Gemini first (has a free tier), then OpenAI, and
 * returns null if neither is configured or both fail — callers then fall back
 * to their own deterministic output.
 */

export type AiMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type AiResult = { text: string; provider: "gemini" | "openai" };

type Opts = { maxTokens?: number; temperature?: number };

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-flash-lite-latest";
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

/** Google Gemini (generativelanguage API). Key sent as a header, not in the URL. */
async function callGemini(
  key: string,
  messages: AiMessage[],
  opts: Opts,
): Promise<string | null> {
  const system = messages
    .filter((m) => m.role === "system")
    .map((m) => m.content)
    .join("\n\n");

  const contents = messages
    .filter((m) => m.role !== "system")
    .map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

  const body: Record<string, unknown> = {
    contents,
    generationConfig: {
      temperature: opts.temperature ?? 0.4,
      maxOutputTokens: opts.maxTokens ?? 500,
    },
  };
  if (system) body.systemInstruction = { parts: [{ text: system }] };

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify(body),
    },
  );
  if (!res.ok) return null;

  const data = await res.json();
  const text: string | undefined = data?.candidates?.[0]?.content?.parts
    ?.map((p: { text?: string }) => p.text ?? "")
    .join("")
    .trim();
  return text || null;
}

/** OpenAI chat completions. */
async function callOpenAI(
  key: string,
  messages: AiMessage[],
  opts: Opts,
): Promise<string | null> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      temperature: opts.temperature ?? 0.4,
      max_tokens: opts.maxTokens ?? 500,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    }),
  });
  if (!res.ok) return null;

  const data = await res.json();
  const text: string | undefined = data?.choices?.[0]?.message?.content?.trim();
  return text || null;
}

/**
 * Generate text from the first configured provider that succeeds.
 * Order: Gemini (free tier) → OpenAI. Returns null if none succeed.
 */
export async function generateAi(
  messages: AiMessage[],
  opts: Opts = {},
): Promise<AiResult | null> {
  const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (geminiKey) {
    try {
      const text = await callGemini(geminiKey, messages, opts);
      if (text) return { text, provider: "gemini" };
    } catch {
      // fall through to the next provider
    }
  }

  const openaiKey = process.env.OPENAI_API_KEY;
  if (openaiKey) {
    try {
      const text = await callOpenAI(openaiKey, messages, opts);
      if (text) return { text, provider: "openai" };
    } catch {
      // fall through to the deterministic fallback
    }
  }

  return null;
}
