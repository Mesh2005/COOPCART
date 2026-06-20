import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { AccountStatus, BusinessType } from "@/lib/types";

export interface AdminCustomerRow {
  id: string;
  business_name: string;
  business_type: BusinessType;
  br_number: string | null;
  contact_person: string | null;
  phone: string | null;
  email: string | null;
  city: string | null;
  status: AccountStatus;
  cod_limit: number | null;
  notes: string | null;
  created_at: string;
  approved_at: string | null;
  owner_email: string | null;
  owner_name: string | null;
  order_count: number;
}

export async function getCustomers(
  status?: AccountStatus,
): Promise<AdminCustomerRow[]> {
  const supabase = await createSupabaseServerClient();
  let q = supabase
    .from("businesses")
    .select(
      `id, business_name, business_type, br_number, contact_person, phone, email,
       city, status, cod_limit, notes, created_at, approved_at,
       profiles!owner_user_id ( full_name, email )`,
    )
    .order("created_at", { ascending: false });
  if (status) q = q.eq("status", status);
  const { data } = await q;

  const ids = (data ?? []).map((b: any) => b.id);
  let orderCounts: Record<string, number> = {};
  if (ids.length > 0) {
    const { data: counts } = await supabase
      .from("orders")
      .select("business_id")
      .in("business_id", ids);
    (counts ?? []).forEach((o: any) => {
      orderCounts[o.business_id] = (orderCounts[o.business_id] ?? 0) + 1;
    });
  }

  return (data ?? []).map((b: any) => ({
    id: b.id,
    business_name: b.business_name,
    business_type: b.business_type,
    br_number: b.br_number,
    contact_person: b.contact_person,
    phone: b.phone,
    email: b.email,
    city: b.city,
    status: b.status,
    cod_limit: b.cod_limit,
    notes: b.notes,
    created_at: b.created_at,
    approved_at: b.approved_at,
    owner_email: b.profiles?.email ?? null,
    owner_name: b.profiles?.full_name ?? null,
    order_count: orderCounts[b.id] ?? 0,
  }));
}

export async function getCustomerById(id: string) {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("businesses")
    .select(
      `*, profiles!owner_user_id ( full_name, email, phone, role, created_at )`,
    )
    .eq("id", id)
    .single();
  return data ?? null;
}
