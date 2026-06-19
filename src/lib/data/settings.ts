import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { AppSettings, BankAccount } from "@/lib/types";

export async function getAppSettings(): Promise<AppSettings | null> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.from("app_settings").select("*").eq("id", true).maybeSingle();
  return (data as AppSettings | null) ?? null;
}

export async function getActiveBankAccounts(): Promise<BankAccount[]> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("bank_accounts")
    .select("*")
    .eq("is_active", true)
    .order("created_at");
  return (data ?? []) as unknown as BankAccount[];
}
