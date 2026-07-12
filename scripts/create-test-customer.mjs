/**
 * Creates a ready-to-use test CUSTOMER account for exercising the system
 * (login → order → tracking). Mirrors the real registration flow: an
 * email-confirmed auth user + a matching business row.
 *
 * The business starts as `pending` so you can practise approving it from the
 * admin console. Pass `--approved` to create it already approved.
 *
 * Usage (PowerShell), run from the project root:
 *   node scripts/create-test-customer.mjs            # pending (approve in /admin)
 *   node scripts/create-test-customer.mjs --approved # ready to order immediately
 *
 * Reads Supabase keys from .env.local (service role — never exposed to the
 * browser). Safe to re-run: it reuses the account if it already exists.
 */
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const env = Object.fromEntries(
  readFileSync(".env.local", "utf8")
    .split(/\r?\n/)
    .filter((l) => l && !l.startsWith("#"))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    }),
);

const approved = process.argv.includes("--approved");

const ACCOUNT = {
  email: "test.customer@coopcart.lk",
  password: "Test1234",
  fullName: "Test Customer",
  phone: "0771234567",
  business: {
    business_name: "Test Shop",
    business_type: "shop",
    contact_person: "Test Customer",
    address_line1: "123 Market Road",
    city: "Negombo",
  },
};

const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function findUserByEmail(email) {
  const { data } = await sb.auth.admin.listUsers({ perPage: 1000 });
  return data.users.find((u) => u.email?.toLowerCase() === email.toLowerCase()) ?? null;
}

async function main() {
  // 1. Create (or reuse) the email-confirmed auth user.
  let userId;
  const { data: created, error: createErr } = await sb.auth.admin.createUser({
    email: ACCOUNT.email,
    password: ACCOUNT.password,
    email_confirm: true,
    user_metadata: { full_name: ACCOUNT.fullName, phone: ACCOUNT.phone },
  });

  if (createErr) {
    if (/already|registered|exists/i.test(createErr.message)) {
      const existing = await findUserByEmail(ACCOUNT.email);
      if (!existing) throw new Error(`Account exists but could not be found: ${createErr.message}`);
      userId = existing.id;
      // Reset the password so the printed credentials always work.
      await sb.auth.admin.updateUserById(userId, { password: ACCOUNT.password });
      console.log("→ Account already existed — reused and reset its password.");
    } else {
      throw createErr;
    }
  } else {
    userId = created.user.id;
    console.log("→ Created auth user.");
  }

  // 2. Ensure a business row exists for this user.
  const status = approved ? "approved" : "pending";
  const { data: biz } = await sb
    .from("businesses")
    .select("id, status")
    .eq("owner_user_id", userId)
    .maybeSingle();

  if (biz) {
    await sb.from("businesses").update({ status }).eq("id", biz.id);
    console.log(`→ Business already existed — set status to '${status}'.`);
  } else {
    const { error: bizErr } = await sb.from("businesses").insert({
      owner_user_id: userId,
      ...ACCOUNT.business,
      phone: ACCOUNT.phone,
      email: ACCOUNT.email,
      status,
    });
    if (bizErr) throw bizErr;
    console.log(`→ Created business '${ACCOUNT.business.business_name}' (status: ${status}).`);
  }

  console.log("\n✓ Test customer ready.");
  console.log("  ────────────────────────────────");
  console.log(`  Email:    ${ACCOUNT.email}`);
  console.log(`  Password: ${ACCOUNT.password}`);
  console.log(`  Status:   ${status}${approved ? "" : "  (approve it in /admin → Customers)"}`);
  console.log("  ────────────────────────────────");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(`\n✗ ${err.message}\n`);
    process.exit(1);
  });
