import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { StaffRole } from "@/lib/types";

export interface StaffRow {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  role: StaffRole;
  is_active: boolean;
  created_at: string;
}

export async function getStaffList(): Promise<StaffRow[]> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, full_name, email, phone, role, is_active, created_at")
    .in("role", ["admin", "manager", "sales", "inventory", "delivery"])
    .order("created_at", { ascending: false });
  return (data ?? []) as StaffRow[];
}
