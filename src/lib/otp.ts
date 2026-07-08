import "server-only";
import { createHash, randomInt } from "node:crypto";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const CODE_TTL_MS = 10 * 60 * 1000; // 10 minutes
const MAX_ATTEMPTS = 5;

function hashCode(email: string, code: string): string {
  return createHash("sha256")
    .update(`${email.toLowerCase()}:${code}`)
    .digest("hex");
}

/** Generate a 6-digit code, store its hash for the email, and return the code. */
export async function createOtp(email: string): Promise<string> {
  const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
  const admin = createSupabaseAdminClient();
  await admin.from("email_otps").upsert({
    email: email.toLowerCase(),
    code_hash: hashCode(email, code),
    purpose: "signup",
    expires_at: new Date(Date.now() + CODE_TTL_MS).toISOString(),
    attempts: 0,
    created_at: new Date().toISOString(),
  });
  return code;
}

export type OtpResult =
  | { ok: true }
  | { ok: false; reason: "missing" | "expired" | "too_many" | "mismatch" };

/** Verify a submitted code for an email. On success the row is consumed. */
export async function verifyOtp(email: string, code: string): Promise<OtpResult> {
  const admin = createSupabaseAdminClient();
  const key = email.toLowerCase();

  const { data: row } = await admin
    .from("email_otps")
    .select("code_hash, expires_at, attempts")
    .eq("email", key)
    .maybeSingle();

  if (!row) return { ok: false, reason: "missing" };
  if (new Date(row.expires_at).getTime() < Date.now()) {
    await admin.from("email_otps").delete().eq("email", key);
    return { ok: false, reason: "expired" };
  }
  if (row.attempts >= MAX_ATTEMPTS) {
    await admin.from("email_otps").delete().eq("email", key);
    return { ok: false, reason: "too_many" };
  }

  if (row.code_hash !== hashCode(email, code)) {
    await admin
      .from("email_otps")
      .update({ attempts: row.attempts + 1 })
      .eq("email", key);
    return { ok: false, reason: "mismatch" };
  }

  await admin.from("email_otps").delete().eq("email", key);
  return { ok: true };
}
