import { createBrowserClient } from "@supabase/ssr";
import { requireEnv } from "@/lib/env";

/** Supabase client for Client Components (browser). */
export function createSupabaseBrowserClient() {
  return createBrowserClient(
    requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
  );
}
