import { NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/auth";
import { getReportData, type ReportSummary } from "@/lib/data/admin/reports";
import { STAFF_ROLES } from "@/lib/types";
import { formatLKR } from "@/lib/format";
import { generateAi } from "@/lib/ai";

export const runtime = "nodejs";

const ALLOWED_DAYS = [7, 14, 30, 90];

/** A few derived figures shared by the AI prompt and the offline fallback. */
function derive(report: ReportSummary) {
  const topGrade = report.byGrade[0]; // byGrade is sorted by revenue desc
  const cod = report.byPaymentMethod.find((m) => m.method === "cod");
  const bank = report.byPaymentMethod.find((m) => m.method === "bank_transfer");
  const sorted = [...report.daily].sort((a, b) => a.date.localeCompare(b.date));
  const mid = Math.floor(sorted.length / 2);
  const firstHalf = sorted.slice(0, mid).reduce((s, d) => s + d.revenue, 0);
  const secondHalf = sorted.slice(mid).reduce((s, d) => s + d.revenue, 0);
  const trendPct =
    sorted.length >= 4 && firstHalf > 0
      ? Math.round(((secondHalf - firstHalf) / firstHalf) * 100)
      : null;
  return { topGrade, cod, bank, trendPct };
}

/** Deterministic summary used when no OpenAI key is set (or the call fails). */
function ruleBasedInsights(report: ReportSummary, days: number): string {
  const { topGrade, cod, bank, trendPct } = derive(report);
  const insights: string[] = [
    `• Over the last ${days} days: ${formatLKR(report.totalRevenue)} across ${report.totalOrders} order${report.totalOrders !== 1 ? "s" : ""} (avg ${formatLKR(report.avgOrderValue)}), ${report.totalTrays} trays sold.`,
  ];
  if (topGrade) {
    insights.push(
      `• ${topGrade.grade} is the top grade by revenue (${formatLKR(topGrade.revenue)}, ${topGrade.trays} trays).`,
    );
  }
  if (bank || cod) {
    const parts: string[] = [];
    if (bank) parts.push(`${bank.count} bank transfer${bank.count !== 1 ? "s" : ""}`);
    if (cod) parts.push(`${cod.count} COD`);
    insights.push(`• Payment mix: ${parts.join(" vs ")}.`);
  }
  if (trendPct !== null) {
    insights.push(
      `• Revenue is trending ${trendPct >= 0 ? "up" : "down"} ${Math.abs(trendPct)}% across the period (second half vs first).`,
    );
  }

  const actions: string[] = [];
  if (report.pendingPayments > 0) {
    actions.push(
      `• Clear ${report.pendingPayments} payment${report.pendingPayments !== 1 ? "s" : ""} awaiting verification to free up customers' COD limits.`,
    );
  }
  if (report.pendingOrders > 0) {
    actions.push(
      `• Confirm ${report.pendingOrders} pending order${report.pendingOrders !== 1 ? "s" : ""}.`,
    );
  }
  if (topGrade) actions.push(`• Keep ${topGrade.grade} well stocked — it drives the most revenue.`);

  let out = `Key insights\n${insights.join("\n")}`;
  if (actions.length) out += `\n\nRecommended actions\n${actions.join("\n")}`;
  return out;
}

const SYSTEM_PROMPT = `You are a concise business analyst for CoopCart, a wholesale brown-egg supplier (Abeyrathna Farms, Sri Lanka). Eggs are sold by the tray of 30 and priced in LKR. You are given aggregated sales metrics for a period. Write a short, plain-English analysis for the shop manager using exactly two sections with bullet points:
"Key insights" — 3 to 5 bullets covering the notable figures, the top-selling grade, the payment mix, and any trend.
"Recommended actions" — 2 to 3 practical bullets.
Be specific using only the numbers provided; never invent data. Write currency as LKR (e.g. "Rs. 12,000"). Keep the whole response under 150 words.`;

export async function POST(req: Request) {
  // Admin/staff only — the API key must never be reachable by customers.
  const profile = await getCurrentProfile();
  if (!profile || !(STAFF_ROLES as readonly string[]).includes(profile.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let days = 30;
  try {
    const body = await req.json();
    if (ALLOWED_DAYS.includes(body?.days)) days = body.days;
  } catch {
    // fall through with the default period
  }

  const report = await getReportData(days);

  if (report.totalOrders === 0) {
    return NextResponse.json({
      insights: `No orders in the last ${days} days yet. Once orders come in, this panel summarises revenue, the top grades, the payment mix, and trends.`,
      source: "rules",
    });
  }

  // Only aggregated figures leave the server — no customer names or raw orders.
  const { trendPct } = derive(report);
  const metrics = {
    periodDays: days,
    totalRevenueLKR: report.totalRevenue,
    totalOrders: report.totalOrders,
    totalTrays: report.totalTrays,
    avgOrderValueLKR: Math.round(report.avgOrderValue),
    pendingPayments: report.pendingPayments,
    pendingOrders: report.pendingOrders,
    revenueByGrade: report.byGrade,
    paymentMethods: report.byPaymentMethod,
    revenueTrendPctSecondHalfVsFirst: trendPct,
  };

  const ai = await generateAi(
    [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: `Metrics (JSON):\n${JSON.stringify(metrics)}` },
    ],
    { maxTokens: 400, temperature: 0.4 },
  );

  if (ai) {
    return NextResponse.json({ insights: ai.text, source: ai.provider });
  }
  return NextResponse.json({ insights: ruleBasedInsights(report, days), source: "rules" });
}
