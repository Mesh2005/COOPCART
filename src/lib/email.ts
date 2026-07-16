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

// --- shared branded template ------------------------------------------------
// Email-client-safe: table layout, inline styles, web-safe fonts, a preheader
// for the inbox preview, and a bulletproof button.

function shell(heading: string, bodyHtml: string, preheader = ""): string {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <meta name="x-apple-disable-message-reformatting">
  <style>:root { color-scheme: light; supported-color-schemes: light; }</style>
</head>
<body style="margin:0;padding:0;background:#f4ece0;">
  ${preheader ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;height:0;width:0;">${preheader}</div>` : ""}
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f4ece0;">
    <tr>
      <td align="center" style="padding:28px 14px;">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0" style="width:560px;max-width:560px;background:#ffffff;border-radius:18px;overflow:hidden;border:1px solid #ece1d1;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
          <tr>
            <td style="background:#5b3a24;padding:20px 32px;">
              <div style="font-size:21px;font-weight:700;color:#fbf3e7;letter-spacing:.2px;line-height:1.25;">
                <span style="font-size:22px;">🥚</span>&nbsp;CoopCart
              </div>
              <div style="margin-top:6px;font-size:11px;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:#d9b892;line-height:1.25;">
                Abeyrathna Farms
              </div>
            </td>
          </tr>
          <tr><td style="height:4px;line-height:4px;font-size:0;background:#e6a23c;">&nbsp;</td></tr>
          <tr>
            <td style="padding:34px 32px 30px;color:#2a231d;">
              <h1 style="margin:0 0 16px;font-size:22px;line-height:1.3;color:#3d2a1c;font-weight:700;">${heading}</h1>
              ${bodyHtml}
            </td>
          </tr>
          <tr>
            <td style="background:#faf3e7;padding:20px 32px;border-top:1px solid #ece1d1;">
              <p style="margin:0;font-size:12px;line-height:1.7;color:#9b8b7b;">
                <b style="color:#6f4a2e;">Abeyrathna Farms</b><br>
                Kuliyapitiya, Sri Lanka &middot; <a href="tel:+94741923702" style="color:#9b8b7b;text-decoration:none;">074 192 3702</a>
              </p>
              <p style="margin:10px 0 0;font-size:11px;color:#b7a898;">Wholesale farm-fresh eggs, delivered on schedule.</p>
            </td>
          </tr>
        </table>
        <p style="margin:16px 0 0;font-size:11px;color:#b7a898;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">You're receiving this because you have a CoopCart account.</p>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function p(text: string): string {
  return `<p style="margin:0 0 18px;font-size:15px;line-height:1.65;color:#6b5d4f;">${text}</p>`;
}

function button(href: string, label: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
    <td style="border-radius:9999px;background:#6f4a2e;">
      <a href="${href}" style="display:inline-block;padding:13px 28px;font-size:14px;font-weight:600;color:#fbf7f0;text-decoration:none;border-radius:9999px;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">${label}&nbsp;&rarr;</a>
    </td>
  </tr></table>`;
}

function codeBlock(code: string): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
    <td align="center" style="background:#faf3e7;border:1px solid #ece1d1;border-radius:14px;padding:24px;">
      <div style="font-size:36px;font-weight:700;letter-spacing:12px;text-indent:12px;color:#3d2a1c;font-family:'Courier New',Courier,monospace;">${code}</div>
    </td>
  </tr></table>`;
}

// --- OTP (signup + password reset) ------------------------------------------
export async function sendOtpEmail(to: string, code: string): Promise<SendResult> {
  const body = `
    ${p("Welcome! Use the code below to verify your email and finish setting up your CoopCart wholesale account.")}
    ${codeBlock(code)}
    <p style="margin:16px 0 0;font-size:13px;color:#9b8b7b;">This code expires in 10 minutes. If you didn't request it, you can safely ignore this email.</p>`;
  return sendEmail(
    to,
    `Your CoopCart verification code: ${code}`,
    shell("Verify your email", body, `Your verification code is ${code}`),
  );
}

export async function sendPasswordResetOtpEmail(to: string, code: string): Promise<SendResult> {
  const body = `
    ${p("We received a request to reset your CoopCart password. Enter this code to choose a new one.")}
    ${codeBlock(code)}
    <p style="margin:16px 0 0;font-size:13px;color:#9b8b7b;">This code expires in 10 minutes. If you didn't request a reset, ignore this email — your password stays the same.</p>`;
  return sendEmail(
    to,
    `Your CoopCart password reset code: ${code}`,
    shell("Reset your password", body, `Your password reset code is ${code}`),
  );
}

// --- transactional order emails ---------------------------------------------
export async function sendOrderConfirmationEmail(
  to: string,
  o: { id: string; orderNumber: string; total: number; fulfillment: string; date: string | null; paymentMethod: string },
): Promise<SendResult> {
  const row = (k: string, v: string) =>
    `<tr>
      <td style="padding:10px 0;font-size:14px;color:#8a7b6c;">${k}</td>
      <td style="padding:10px 0;font-size:14px;font-weight:600;color:#2a231d;text-align:right;">${v}</td>
    </tr>`;
  const body = `
    ${p("Thanks for your order — we've received it and will confirm it shortly. Here's a summary:")}
    <div style="background:#faf3e7;border:1px solid #ece1d1;border-radius:14px;padding:4px 20px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
        ${row("Order number", o.orderNumber)}
        ${row(o.fulfillment === "delivery" ? "Delivery date" : "Pickup date", o.date ? formatDate(o.date) : "To be scheduled")}
        ${row("Payment", o.paymentMethod === "cod" ? "Cash on delivery" : "Bank transfer")}
        <tr>
          <td style="padding:14px 0 12px;font-size:15px;font-weight:700;color:#3d2a1c;border-top:1px solid #ece1d1;">Total</td>
          <td style="padding:14px 0 12px;font-size:18px;font-weight:700;color:#6f4a2e;text-align:right;border-top:1px solid #ece1d1;">${formatLKR(o.total)}</td>
        </tr>
      </table>
    </div>
    <div style="margin-top:24px;">${button(`${SITE_URL}/app/orders/${o.id}`, "View your order")}</div>`;
  return sendEmail(
    to,
    `Order ${o.orderNumber} received · CoopCart`,
    shell("We've got your order", body, `Order ${o.orderNumber} received — total ${formatLKR(o.total)}`),
  );
}

export async function sendOrderStatusEmail(
  to: string,
  o: { id: string; orderNumber: string; status: string },
): Promise<SendResult> {
  const label = o.status.replace(/_/g, " ");
  const body = `
    ${p(`Good news — there's an update on your order <b style="color:#2a231d;">${o.orderNumber}</b>.`)}
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 22px;"><tr>
      <td style="background:#e9f2e5;border-radius:9999px;padding:8px 16px;font-size:13px;font-weight:700;text-transform:capitalize;letter-spacing:.3px;color:#3f6b34;">${label}</td>
    </tr></table>
    <div>${button(`${SITE_URL}/app/orders/${o.id}`, "Track your order")}</div>`;
  return sendEmail(
    to,
    `Order ${o.orderNumber} is ${label} · CoopCart`,
    shell("Order update", body, `${o.orderNumber} is now ${label}`),
  );
}

export async function sendPaymentVerifiedEmail(
  to: string,
  o: { id: string; orderNumber: string },
): Promise<SendResult> {
  const body = `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 18px;"><tr>
      <td style="width:44px;height:44px;background:#e9f2e5;border-radius:9999px;text-align:center;font-size:22px;line-height:44px;">✓</td>
    </tr></table>
    ${p(`We've verified your payment for order <b style="color:#2a231d;">${o.orderNumber}</b>. It's all set — thank you!`)}
    <div>${button(`${SITE_URL}/app/orders/${o.id}`, "View your order")}</div>`;
  return sendEmail(
    to,
    `Payment verified for ${o.orderNumber} · CoopCart`,
    shell("Payment verified", body, `Payment verified for ${o.orderNumber}`),
  );
}
