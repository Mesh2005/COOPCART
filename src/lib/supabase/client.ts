import { createBrowserClient } from "@supabase/ssr";

// NEXT_PUBLIC_* vars are only inlined into the browser bundle when accessed as
// static literals (process.env.NEXT_PUBLIC_X) — a dynamic process.env[name]
// lookup is undefined in the browser. These are public keys, safe to expose.
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** Supabase client for Client Components (browser). */
export function createSupabaseBrowserClient() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error(
      "Supabase browser env is missing. Ensure NEXT_PUBLIC_SUPABASE_URL and " +
        "NEXT_PUBLIC_SUPABASE_ANON_KEY are set, then restart the dev server.",
    );
  }
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}
