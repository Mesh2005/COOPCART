/**
 * Adds a staff/admin role — the reliable way (no dependency on invite emails).
 *
 * - If the email already has an account (e.g. a customer), it is PROMOTED to
 *   the given role.
 * - If not, an email-confirmed staff account is CREATED with a known password.
 *
 * Roles: admin | manager | sales | inventory | delivery   (default: admin)
 *
 * Usage (PowerShell), from the project root:
 *   node scripts/create-staff.mjs boss@abeyrathna.lk               # new admin
 *   node scripts/create-staff.mjs sunil@abeyrathna.lk manager      # new manager
 *   node scripts/create-staff.mjs test.customer@coopcart.lk admin  # promote existing
 *   node scripts/create-staff.mjs boss@abeyrathna.lk admin "MyPass123"
 *
 * Reads the service-role key from .env.local.
 */
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const STAFF_ROLES = ["admin", "manager", "sales", "inventory", "delivery"];

const email = process.argv[2];
const role = (process.argv[3] || "admin").toLowerCase();
const password = process.argv[4] || "Admin1234";

if (!email) {
  console.error("✗ Usage: node scripts/create-staff.mjs <email> [role] [password]");
  process.exit(1);
}
if (!STAFF_ROLES.includes(role)) {
  console.error(`✗ Invalid role '${role}'. Choose one of: ${STAFF_ROLES.join(", ")}`);
  process.exit(1);
}

const env = Object.fromEntries(
  readFileSync(".env.local", "utf8")
    .split(/\r?\n/)
    .filter((l) => l && !l.startsWith("#"))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    }),
);

const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function findUserByEmail(e) {
  const { data } = await sb.auth.admin.listUsers({ perPage: 1000 });
  return data.users.find((u) => u.email?.toLowerCase() === e.toLowerCase()) ?? null;
}

async function main() {
  let userId;
  let created = false;

  const existing = await findUserByEmail(email);
  if (existing) {
    userId = existing.id;
    console.log("→ Account exists — promoting.");
  } else {
    const { data, error } = await sb.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: email.split("@")[0] },
    });
    if (error) throw error;
    userId = data.user.id;
    created = true;
    console.log("→ Created email-confirmed staff account.");
  }

  // The handle_new_user trigger seeds profiles.role = 'customer'; set the real
  // role here (and make sure the account is active).
  const { error: roleErr } = await sb
    .from("profiles")
    .update({ role, is_active: true })
    .eq("id", userId);
  if (roleErr) throw roleErr;

  console.log(`\n✓ ${email} is now '${role}'.`);
  console.log("  ────────────────────────────────");
  console.log(`  Sign in at: /admin`);
  console.log(`  Email:      ${email}`);
  if (created) console.log(`  Password:   ${password}`);
  else console.log(`  Password:   (unchanged — their existing password)`);
  console.log("  ────────────────────────────────");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(`\n✗ ${err.message}\n`);
    process.exit(1);
  });
