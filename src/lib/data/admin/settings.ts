import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { AppSettings, BankAccount, DeliveryZone } from "@/lib/types";

export async function getAdminSettings(): Promise<AppSettings | null> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.from("app_settings").select("*").single();
  return data ?? null;
}

export async function getBankAccounts(): Promise<BankAccount[]> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("bank_accounts")
    .select("*")
    .order("is_active", { ascending: false });
  return (data ?? []) as BankAccount[];
}

export async function getDeliveryZones(): Promise<DeliveryZone[]> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("delivery_zones")
    .select("*")
    .order("name");
  return (data ?? []) as DeliveryZone[];
}

export async function getBlackoutDates(): Promise<
  { id: string; date: string; reason: string | null }[]
> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("delivery_blackout_dates")
    .select("id, date, reason")
    .gte("date", new Date().toISOString().split("T")[0])
    .order("date");
  return data ?? [];
}
