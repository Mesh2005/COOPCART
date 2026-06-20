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
      `id, owner_user_id, business_name, business_type, br_number, contact_person,
       phone, email, city, status, cod_limit, notes, created_at, approved_at`,
    )
    .order("created_at", { ascending: false });
  if (status) q = q.eq("status", status);
  const { data } = await q;
  const businesses = data ?? [];

  // businesses.owner_user_id references auth.users, not profiles, so there is
  // no PostgREST relationship to embed — fetch the owner profiles separately.
  const ownerIds = [
    ...new Set(businesses.map((b: any) => b.owner_user_id).filter(Boolean)),
  ];
  const profileMap: Record<string, { full_name: string | null; email: string | null }> = {};
  if (ownerIds.length > 0) {
    const { data: profs } = await supabase
      .from("profiles")
      .select("id, full_name, email")
      .in("id", ownerIds);
    (profs ?? []).forEach((p: any) => {
      profileMap[p.id] = { full_name: p.full_name, email: p.email };
    });
  }

  const ids = businesses.map((b: any) => b.id);
  const orderCounts: Record<string, number> = {};
  if (ids.length > 0) {
    const { data: counts } = await supabase
      .from("orders")
      .select("business_id")
      .in("business_id", ids);
    (counts ?? []).forEach((o: any) => {
      orderCounts[o.business_id] = (orderCounts[o.business_id] ?? 0) + 1;
    });
  }

  return businesses.map((b: any) => ({
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
    owner_email: profileMap[b.owner_user_id]?.email ?? b.email ?? null,
    owner_name: profileMap[b.owner_user_id]?.full_name ?? b.contact_person ?? null,
    order_count: orderCounts[b.id] ?? 0,
  }));
}

export async function getCustomerById(id: string) {
  const supabase = await createSupabaseServerClient();
  const { data: business } = await supabase
    .from("businesses")
    .select("*")
    .eq("id", id)
    .single();
  if (!business) return null;

  const { data: owner } = await supabase
    .from("profiles")
    .select("full_name, email, phone, role, created_at")
    .eq("id", business.owner_user_id)
    .maybeSingle();

  return { ...business, owner };
}
