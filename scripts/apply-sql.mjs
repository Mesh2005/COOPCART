/**
 * Applies a SINGLE .sql file to the Supabase Postgres instance. Unlike
 * db-setup.mjs (which re-runs the full schema + seed and would reset data),
 * this runs exactly one migration — safe against a live database.
 *
 * Usage (PowerShell):
 *   $env:DATABASE_URL="postgresql://postgres:PASS@db.<ref>.supabase.co:5432/postgres"
 *   node scripts/apply-sql.mjs supabase/migrations/20260711120000_order_tracking.sql
 *
 * The connection string is read from the environment so the password is never
 * written to a committed file.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, isAbsolute } from "node:path";
import pg from "pg";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const rel = process.argv[2];
if (!rel) {
  console.error("✗ Usage: node scripts/apply-sql.mjs <path-to-.sql>");
  process.exit(1);
}
const file = isAbsolute(rel) ? rel : join(root, rel);

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("✗ DATABASE_URL is not set.");
  process.exit(1);
}

const client = new pg.Client({ connectionString, ssl: { rejectUnauthorized: false } });

async function main() {
  const sql = readFileSync(file, "utf8");
  console.log("→ Connecting to Supabase Postgres…");
  await client.connect();
  process.stdout.write(`→ Applying ${rel} … `);
  await client.query(sql);
  console.log("done.");
}

main()
  .then(() => client.end())
  .then(() => {
    console.log("\n✓ Migration applied.");
    process.exit(0);
  })
  .catch(async (err) => {
    console.log("FAILED.");
    console.error(`\n✗ ${err.message}\n`);
    await client.end().catch(() => {});
    process.exit(1);
  });
