import "server-only";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
// Resend's shared sender works out of the box for testing; swap for your own
// verified domain (e.g. no-reply@abeyrathnafarms.lk) once DNS is set up.
const FROM = process.env.EMAIL_FROM || "CoopCart <onboarding@resend.dev>";

export const hasEmailProvider = Boolean(RESEND_API_KEY);

type SendResult = { delivered: boolean; error?: string };

async function sendEmail(to: string, subject: string, html: string): Promise<SendResult> {
  if (!RESEND_API_KEY) return { delivered: false };
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

export async function sendOtpEmail(to: string, code: string): Promise<SendResult> {
  const html = `
  <div style="font-family:system-ui,-apple-system,sans-serif;max-width:480px;margin:0 auto;padding:24px;color:#2a231d">
    <h1 style="font-size:20px;color:#6f4a2e;margin:0 0 8px">Verify your email</h1>
    <p style="margin:0 0 16px;color:#8a7b6c">
      Use this code to finish creating your CoopCart wholesale account. It expires in 10 minutes.
    </p>
    <div style="font-size:34px;font-weight:700;letter-spacing:10px;color:#2a1d14;background:#faf3e7;
                border:1px solid #eae0d2;border-radius:12px;padding:16px;text-align:center">
      ${code}
    </div>
    <p style="margin:16px 0 0;color:#8a7b6c;font-size:12px">
      If you didn't request this, you can safely ignore this email. — Abeyrathna Farms
    </p>
  </div>`;
  return sendEmail(to, `Your CoopCart verification code: ${code}`, html);
}
