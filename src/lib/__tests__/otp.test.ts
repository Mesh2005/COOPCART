import { createHash } from "node:crypto";
import { createOtp, verifyOtp } from "@/lib/otp";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

// otp.ts is a server module that talks to Supabase; we stub both so the test
// exercises only the OTP logic (code generation, hashing, verification rules).
jest.mock("server-only", () => ({}));
jest.mock("@/lib/supabase/admin", () => ({
  createSupabaseAdminClient: jest.fn(),
}));

const mockedCreate = createSupabaseAdminClient as jest.Mock;

// Recreate the same hashing the module uses, so we can build valid stored rows.
function hash(email: string, code: string): string {
  return createHash("sha256")
    .update(`${email.toLowerCase()}:${code}`)
    .digest("hex");
}

// A fake Supabase admin client whose query builder records the calls we assert.
function fakeAdmin(row: unknown = null) {
  const upsert = jest.fn().mockResolvedValue({ error: null });
  const deleteEq = jest.fn().mockResolvedValue({});
  const updateEq = jest.fn().mockResolvedValue({});
  const chain: Record<string, unknown> = {};
  chain.upsert = upsert;
  chain.select = jest.fn(() => chain);
  chain.eq = jest.fn(() => chain);
  chain.maybeSingle = jest.fn().mockResolvedValue({ data: row });
  chain.delete = jest.fn(() => ({ eq: deleteEq }));
  chain.update = jest.fn(() => ({ eq: updateEq }));
  return { client: { from: jest.fn(() => chain) }, upsert, deleteEq, updateEq };
}

describe("createOtp", () => {
  it("returns a six-digit numeric code", async () => {
    const a = fakeAdmin();
    mockedCreate.mockReturnValue(a.client);
    const code = await createOtp("User@Example.com");
    expect(code).toMatch(/^\d{6}$/);
  });

  it("stores the code hashed (never plaintext) under the lower-cased email", async () => {
    const a = fakeAdmin();
    mockedCreate.mockReturnValue(a.client);
    const code = await createOtp("User@Example.com");

    expect(a.upsert).toHaveBeenCalledTimes(1);
    const stored = a.upsert.mock.calls[0][0];
    expect(stored.email).toBe("user@example.com");
    expect(stored.purpose).toBe("signup");
    expect(stored.attempts).toBe(0);
    expect(stored.code_hash).toMatch(/^[a-f0-9]{64}$/); // sha256 hex
    expect(stored.code_hash).not.toBe(code); // not the raw code
  });
});

describe("verifyOtp", () => {
  const email = "user@example.com";
  const future = () => new Date(Date.now() + 60_000).toISOString();
  const past = () => new Date(Date.now() - 1_000).toISOString();

  it("rejects when no code was stored for the email", async () => {
    const a = fakeAdmin(null);
    mockedCreate.mockReturnValue(a.client);
    expect(await verifyOtp(email, "123456")).toEqual({
      ok: false,
      reason: "missing",
    });
  });

  it("rejects and deletes an expired code", async () => {
    const a = fakeAdmin({ code_hash: hash(email, "123456"), expires_at: past(), attempts: 0 });
    mockedCreate.mockReturnValue(a.client);
    expect(await verifyOtp(email, "123456")).toEqual({ ok: false, reason: "expired" });
    expect(a.deleteEq).toHaveBeenCalled();
  });

  it("rejects and deletes after too many attempts", async () => {
    const a = fakeAdmin({ code_hash: hash(email, "123456"), expires_at: future(), attempts: 5 });
    mockedCreate.mockReturnValue(a.client);
    expect(await verifyOtp(email, "123456")).toEqual({ ok: false, reason: "too_many" });
    expect(a.deleteEq).toHaveBeenCalled();
  });

  it("rejects a wrong code and increments the attempt counter", async () => {
    const a = fakeAdmin({ code_hash: hash(email, "000000"), expires_at: future(), attempts: 1 });
    mockedCreate.mockReturnValue(a.client);
    expect(await verifyOtp(email, "123456")).toEqual({ ok: false, reason: "mismatch" });
    expect(a.updateEq).toHaveBeenCalled();
  });

  it("accepts the correct code and consumes (deletes) it", async () => {
    const a = fakeAdmin({ code_hash: hash(email, "123456"), expires_at: future(), attempts: 0 });
    mockedCreate.mockReturnValue(a.client);
    expect(await verifyOtp(email, "123456")).toEqual({ ok: true });
    expect(a.deleteEq).toHaveBeenCalled();
  });
});
