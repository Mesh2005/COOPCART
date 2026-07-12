import "server-only";
import nodemailer, { type Transporter } from "nodemailer";
import { SITE_URL } from "@/lib/env";
import { formatLKR, formatDate } from "@/lib/format";

// --- provider config --------------------------------------------------------
// SMTP (e.g. Gmail) takes priority: set SMTP_USER + SMTP_PASS (a Google App
// Password) to email real recipients without verifying a domain. Falls back to
// Resend when SMTP isn't configured.
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const SMTP_HOST = process.env.SMTP_HOST || "smtp.gmail.com";
const SMTP_PORT = Number(process.env.SMTP_PORT || 465);
const hasSmtp = Boolean(SMTP_USER && SMTP_PASS);

const RESEND_API_KEY = process.env.RESEND_API_KEY;

// From address. An explicit EMAIL_FROM wins; otherwise use the SMTP mailbox
// (Gmail requires the From to match the authenticated account), else the
// Resend test sender.
const FROM =
  process.env.EMAIL_FROM ||
  (hasSmtp ? `Abeyrathna Farms <${SMTP_USER}>` : "CoopCart <onboarding@resend.dev>");

export const hasEmailProvider = hasSmtp || Boolean(RESEND_API_KEY);

type SendResult = { delivered: boolean; error?: string };

// Reuse one SMTP transport across invocations in a warm server.
let transporter: Transporter | null = null;
function getTransporter(): Transporter {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465, // 465 = implicit TLS, 587 = STARTTLS
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });
  }
  return transporter;
}

async function sendViaSmtp(to: string, subject: string, html: string): Promise<SendResult> {
  try {
    await getTransporter().sendMail({ from: FROM, to, subject, html });
    return { delivered: true };
  } catch (err) {
    return { delivered: false, error: `SMTP: ${(err as Error).message}` };
  }
}

async function sendViaResend(to: string, subject: string, html: string): Promise<SendResult> {
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from: FROM, to, subject, html }),
    });
    if (!res.ok) {
      const detail = await res.text();
      return { delivered: false, error: `Resend ${res.status}: ${detail}` };
    }
    return { delivered: true };
  } catch (err) {
    return { delivered: false, error: (err as Error).message };
  }
}

async function sendEmail(to: string, subject: string, html: string): Promise<SendResult> {
  if (hasSmtp) return sendViaSmtp(to, subject, html);
  if (RESEND_API_KEY) return sendViaResend(to, subject, html);
  return { delivered: false };
}

// --- shared branded shell ---------------------------------------------------
function shell(heading: string, body: string): string {
  return `
  <div style="font-family:system-ui,-apple-system,sans-serif;max-width:520px;margin:0 auto;padding:24px;color:#2a231d">
    <div style="margin-bottom:16px">
      <span style="font-size:18px;font-weight:700;color:#6f4a2e">CoopCart</span>
      <span style="font-size:12px;color:#8a7b6c"> · Abeyrathna Farms</span>
    </div>
    <h1 style="font-size:20px;color:#6f4a2e;margin:0 0 12px">${heading}</h1>
    ${body}
    <p style="margin:24px 0 0;color:#b0a396;font-size:12px;border-top:1px solid #eae0d2;padding-top:12px">
      Abeyrathna Farms · Kuliyapitiya, Sri Lanka · 074 192 3702
    </p>
  </div>`;
}

function button(href: string, label: string): string {
  return `<a href="${href}" style="display:inline-block;background:#6f4a2e;color:#fbf7f0;text-decoration:none;padding:10px 18px;border-radius:9999px;font-size:14px;font-weight:600">${label}</a>`;
}

// --- OTP (signup + password reset) ------------------------------------------
export async function sendOtpEmail(to: string, code: string): Promise<SendResult> {
  const body = `
    <p style="margin:0 0 16px;color:#8a7b6c">Use this code to finish creating your CoopCart wholesale account. It expires in 10 minutes.</p>
    <div style="font-size:34px;font-weight:700;letter-spacing:10px;color:#2a1d14;background:#faf3e7;border:1px solid #eae0d2;border-radius:12px;padding:16px;text-align:center">${code}</div>`;
  return sendEmail(to, `Your CoopCart verification code: ${code}`, shell("Verify your email", body));
}

export async function sendPasswordResetOtpEmail(to: string, code: string): Promise<SendResult> {
  const body = `
    <p style="margin:0 0 16px;color:#8a7b6c">Use this code to reset your CoopCart password. It expires in 10 minutes. If you didn't request this, ignore this email.</p>
    <div style="font-size:34px;font-weight:700;letter-spacing:10px;color:#2a1d14;background:#faf3e7;border:1px solid #eae0d2;border-radius:12px;padding:16px;text-align:center">${code}</div>`;
  return sendEmail(to, `Your CoopCart password reset code: ${code}`, shell("Reset your password", body));
}

// --- transactional order emails ---------------------------------------------
export async function sendOrderConfirmationEmail(
  to: string,
  o: { id: string; orderNumber: string; total: number; fulfillment: string; date: string | null; paymentMethod: string },
): Promise<SendResult> {
  const row = (k: string, v: string, top = false) =>
    `<tr><td style="padding:6px 0;color:#8a7b6c${top ? ";border-top:1px solid #eae0d2" : ""}">${k}</td><td style="text-align:right;font-weight:600${top ? ";border-top:1px solid #eae0d2" : ""}">${v}</td></tr>`;
  const body = `
    <p style="margin:0 0 16px;color:#8a7b6c">Thanks for your order — we've received it and will confirm it shortly.</p>
    <table style="width:100%;font-size:14px;border-collapse:collapse">
      ${row("Order", o.orderNumber)}
      ${row(o.fulfillment === "delivery" ? "Delivery date" : "Pickup date", o.date ? formatDate(o.date) : "—")}
      ${row("Payment", o.paymentMethod === "cod" ? "Cash on delivery" : "Bank transfer")}
      ${row("Total", formatLKR(o.total), true)}
    </table>
    <p style="margin:22px 0 0">${button(`${SITE_URL}/app/orders/${o.id}`, "View order")}</p>`;
  return sendEmail(to, `Order ${o.orderNumber} received · CoopCart`, shell("Order received", body));
}

export async function sendOrderStatusEmail(
  to: string,
  o: { id: string; orderNumber: string; status: string },
): Promise<SendResult> {
  const label = o.status.replace(/_/g, " ");
  const body = `
    <p style="margin:0 0 16px;color:#8a7b6c">Your order <b>${o.orderNumber}</b> is now <b style="color:#2a1d14">${label}</b>.</p>
    <p style="margin:12px 0 0">${button(`${SITE_URL}/app/orders/${o.id}`, "Track order")}</p>`;
  return sendEmail(to, `Order ${o.orderNumber} is ${label} · CoopCart`, shell("Order update", body));
}

export async function sendPaymentVerifiedEmail(
  to: string,
  o: { id: string; orderNumber: string },
): Promise<SendResult> {
  const body = `
    <p style="margin:0 0 16px;color:#8a7b6c">We've verified your payment for order <b>${o.orderNumber}</b>. Thank you!</p>
    <p style="margin:12px 0 0">${button(`${SITE_URL}/app/orders/${o.id}`, "View order")}</p>`;
  return sendEmail(to, `Payment verified for ${o.orderNumber} · CoopCart`, shell("Payment verified", body));
}
