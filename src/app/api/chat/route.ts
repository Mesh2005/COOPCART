import { NextResponse } from "next/server";

export const runtime = "nodejs";

// ---------------------------------------------------------------------------
// Knowledge base — the facts the assistant answers from. Kept in one place so
// both the OpenAI system prompt and the offline FAQ fallback stay in sync.
// ---------------------------------------------------------------------------
const KNOWLEDGE = `
CoopCart is the online wholesale ordering platform for Abeyrathna Farms (Sri Lanka).
It sells fresh BROWN eggs only, in three size grades, sold by the tray of 30:
- Medium (49-55 g), Large (56-62 g), Extra Large (63-70 g).
Minimum order: 5 trays. Prices are per tray and shown in LKR.
Bulk discount tiers: 5-9, 10-24, 25-49, and 50+ trays (bigger orders cost less per tray).
Wholesale prices are only visible after a business account is approved.

Who can buy: registered businesses only (shops, bakeries, restaurants, hotels, caterers, wholesalers) — not households.
Registration: create a business account, verify your email with a 6-digit code, then wait for admin approval before ordering.

Payments: bank transfer (upload your slip in the app for verification) or cash on delivery (COD). No card payments.
Fulfilment: delivery or free pickup from the farm.
Delivery zones: Negombo, Katunayake, Seeduwa, Ja-Ela, Wattala, and Colombo suburbs.
Delivery days: Monday, Wednesday, Friday, Saturday. Order before 6:00 PM the day before for next delivery day.
Delivery fee is variable per zone (base fee plus a small per-tray charge); pickup is free.

Order tracking: customers can track each order from Pending to Confirmed, Packed, Out for delivery / Ready for pickup, then Delivered.
`.trim();

const SYSTEM_PROMPT = `You are the friendly support assistant for CoopCart, the wholesale egg ordering site for Abeyrathna Farms.
Answer customer questions clearly and briefly (1-3 short sentences), only using the facts below.
If you don't know or it's outside these facts, say you're not sure and suggest they contact Abeyrathna Farms. Do not invent prices.

FACTS:
${KNOWLEDGE}`;

// Offline FAQ fallback (used when OPENAI_API_KEY is not configured).
const FAQ: { keywords: RegExp; answer: string }[] = [
  {
    keywords: /minimum|min order|how many trays|smallest/i,
    answer: "The minimum order is 5 trays (each tray holds 30 eggs).",
  },
  {
    keywords: /grade|size|medium|large|weight/i,
    answer:
      "We sell brown eggs in three grades: Medium (49–55 g), Large (56–62 g), and Extra Large (63–70 g), sold by the tray of 30.",
  },
  {
    keywords: /price|cost|how much|pricing|tier|discount|bulk/i,
    answer:
      "Prices are per tray in LKR, with bulk discounts at 5–9, 10–24, 25–49, and 50+ trays. Wholesale prices are shown once your business account is approved.",
  },
  {
    keywords: /pay|payment|bank|transfer|cod|cash|slip/i,
    answer:
      "You can pay by bank transfer (upload your slip in the app for verification) or cash on delivery. We don't take card payments.",
  },
  {
    keywords: /deliver|delivery|zone|area|ship/i,
    answer:
      "We deliver to Negombo, Katunayake, Seeduwa, Ja-Ela, Wattala, and Colombo suburbs on Mon/Wed/Fri/Sat. Order before 6 PM the day before. Pickup from the farm is free.",
  },
  {
    keywords: /pickup|collect/i,
    answer: "Yes — you can pick up your order from the farm for free instead of paying a delivery fee.",
  },
  {
    keywords: /register|sign ?up|account|approv|verify|otp|code/i,
    answer:
      "Register a business account, verify your email with the 6-digit code we send, then our team reviews and approves it. Once approved you'll see pricing and can order.",
  },
  {
    keywords: /track|status|where.*order|order status/i,
    answer:
      "Open Orders in your portal to track each order from Pending → Confirmed → Packed → Out for delivery / Ready for pickup → Delivered.",
  },
  {
    keywords: /white|colou?r|brown/i,
    answer: "We currently sell brown eggs only.",
  },
  {
    keywords: /hello|hi|hey|help|start/i,
    answer:
      "Hi! I'm the CoopCart assistant. Ask me about grades, pricing, minimum order, payment, delivery, or how to register.",
  },
];

function faqAnswer(question: string): string {
  const hit = FAQ.find((f) => f.keywords.test(question));
  return (
    hit?.answer ??
    "I'm not sure about that one — for anything specific, please contact Abeyrathna Farms. I can help with grades, pricing, minimum order, payment, delivery, and registration."
  );
}

type ChatMessage = { role: "user" | "assistant"; content: string };

export async function POST(req: Request) {
  let messages: ChatMessage[] = [];
  try {
    const body = await req.json();
    messages = Array.isArray(body?.messages) ? body.messages : [];
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const lastUser = [...messages].reverse().find((m) => m.role === "user")?.content ?? "";
  const apiKey = process.env.OPENAI_API_KEY;

  // No key → deterministic FAQ answer.
  if (!apiKey) {
    return NextResponse.json({ answer: faqAnswer(lastUser), source: "faq" });
  }

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        temperature: 0.3,
        max_tokens: 300,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages.slice(-8).map((m) => ({
            role: m.role,
            content: String(m.content).slice(0, 1000),
          })),
        ],
      }),
    });

    if (!res.ok) {
      // Fall back gracefully on quota/errors.
      return NextResponse.json({ answer: faqAnswer(lastUser), source: "faq" });
    }
    const data = await res.json();
    const answer =
      data?.choices?.[0]?.message?.content?.trim() || faqAnswer(lastUser);
    return NextResponse.json({ answer, source: "openai" });
  } catch {
    return NextResponse.json({ answer: faqAnswer(lastUser), source: "faq" });
  }
}
