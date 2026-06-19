import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { DeliveryZone } from "@/lib/types";

export async function getActiveZones(): Promise<DeliveryZone[]> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("delivery_zones")
    .select("*")
    .eq("is_active", true)
    .order("name");
  return (data ?? []) as unknown as DeliveryZone[];
}

/** Upcoming blackout dates as ISO strings. */
export async function getBlackoutDates(): Promise<string[]> {
  const supabase = await createSupabaseServerClient();
  const today = new Date().toISOString().slice(0, 10);
  const { data } = await supabase
    .from("delivery_blackout_dates")
    .select("date")
    .gte("date", today);
  return ((data ?? []) as { date: string }[]).map((r) => r.date);
}
