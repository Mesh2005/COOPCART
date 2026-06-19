import { createClient } from "@supabase/supabase-js";
import { requireEnv } from "@/lib/env";

/**
 * Service-role Supabase client that bypasses Row-Level Security.
 * SERVER-ONLY — never import this into a Client Component or expose the key.
 * Use only for trusted server tasks (seeding, privileged admin operations).
 */
export function createSupabaseAdminClient() {
  return createClient(
    requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
