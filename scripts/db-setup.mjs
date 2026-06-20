/**
 * Applies the CoopCart database migrations + seed to a Supabase Postgres
 * instance, in order. Reads the connection string from DATABASE_URL.
 *
 * Usage (PowerShell):
 *   $env:DATABASE_URL="postgresql://postgres:PASS@db.<ref>.supabase.co:5432/postgres"
 *   node scripts/db-setup.mjs
 *
 * The connection string is read from the environment so the password is
 * never written to a committed file.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import pg from "pg";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const FILES = [
  "supabase/migrations/20260619100000_schema.sql",
  "supabase/migrations/20260619100001_functions.sql",
  "supabase/migrations/20260619100002_rls.sql",
  "supabase/seed.sql",
];

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("✗ DATABASE_URL is not set.");
  process.exit(1);
}

const client = new pg.Client({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

async function main() {
  console.log("→ Connecting to Supabase Postgres…");
  await client.connect();
  console.log("✓ Connected.\n");

  for (const file of FILES) {
    const sql = readFileSync(join(root, file), "utf8");
    process.stdout.write(`→ Applying ${file} … `);
    try {
      await client.query(sql);
      console.log("done.");
    } catch (err) {
      console.log("FAILED.");
      console.error(`\n✗ Error in ${file}:\n${err.message}\n`);
      throw err;
    }
  }

  // Quick sanity check
  const { rows } = await client.query(
    "select (select count(*) from public.products) as products, " +
      "(select count(*) from public.delivery_zones) as zones, " +
      "(select count(*) from public.price_tiers) as tiers;",
  );
  console.log("\n✓ All migrations applied. Row counts:", rows[0]);
}

main()
  .then(() => client.end())
  .then(() => {
    console.log("\n✓ Database setup complete.");
    process.exit(0);
  })
  .catch(async () => {
    await client.end().catch(() => {});
    process.exit(1);
  });
