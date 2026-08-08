// ai.ts is a server module; stub server-only and the network so we exercise the
// provider-selection logic (Gemini first, then OpenAI, then null) without real calls.
jest.mock("server-only", () => ({}));

import { generateAi } from "@/lib/ai";

const realFetch = global.fetch;

function geminiOk(text: string) {
  return { ok: true, json: async () => ({ candidates: [{ content: { parts: [{ text }] } }] }) };
}
function openaiOk(text: string) {
  return { ok: true, json: async () => ({ choices: [{ message: { content: text } }] }) };
}
function fail(status: number) {
  return { ok: false, status, text: async () => "error" };
}

describe("generateAi (AI provider selection)", () => {
  const ORIGINAL = process.env;

  beforeEach(() => {
    // next/jest loads .env.local, so clear the keys to control each test.
    process.env = { ...ORIGINAL };
    delete process.env.GEMINI_API_KEY;
    delete process.env.GOOGLE_API_KEY;
    delete process.env.OPENAI_API_KEY;
  });

  afterEach(() => {
    process.env = ORIGINAL;
    global.fetch = realFetch;
    jest.restoreAllMocks();
  });

  it("returns null when no provider is configured (never calls the network)", async () => {
    global.fetch = jest.fn();
    const res = await generateAi([{ role: "user", content: "hi" }]);
    expect(res).toBeNull();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("uses Gemini first when GEMINI_API_KEY is set", async () => {
    process.env.GEMINI_API_KEY = "g-key";
    global.fetch = jest.fn().mockResolvedValue(geminiOk("Hello from Gemini"));
    const res = await generateAi([{ role: "user", content: "hi" }]);
    expect(res).toEqual({ text: "Hello from Gemini", provider: "gemini" });
    expect((global.fetch as jest.Mock).mock.calls[0][0]).toContain("generativelanguage.googleapis.com");
  });

  it("sends the Gemini key as a header, never in the URL", async () => {
    process.env.GEMINI_API_KEY = "secret-key";
    global.fetch = jest.fn().mockResolvedValue(geminiOk("ok"));
    await generateAi([{ role: "user", content: "hi" }]);
    const [url, init] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).not.toContain("secret-key");
    expect(init.headers["x-goog-api-key"]).toBe("secret-key");
  });

  it("falls back to OpenAI when Gemini is not configured", async () => {
    process.env.OPENAI_API_KEY = "o-key";
    global.fetch = jest.fn().mockResolvedValue(openaiOk("Hello from OpenAI"));
    const res = await generateAi([{ role: "user", content: "hi" }]);
    expect(res).toEqual({ text: "Hello from OpenAI", provider: "openai" });
  });

  it("falls back to OpenAI when the Gemini call fails", async () => {
    process.env.GEMINI_API_KEY = "g-key";
    process.env.OPENAI_API_KEY = "o-key";
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce(fail(429)) // Gemini quota exhausted
      .mockResolvedValueOnce(openaiOk("Recovered via OpenAI"));
    const res = await generateAi([{ role: "user", content: "hi" }]);
    expect(res).toEqual({ text: "Recovered via OpenAI", provider: "openai" });
    expect((global.fetch as jest.Mock)).toHaveBeenCalledTimes(2);
  });

  it("returns null when every configured provider fails", async () => {
    process.env.GEMINI_API_KEY = "g-key";
    process.env.OPENAI_API_KEY = "o-key";
    global.fetch = jest.fn().mockResolvedValue(fail(500));
    const res = await generateAi([{ role: "user", content: "hi" }]);
    expect(res).toBeNull();
  });
});
