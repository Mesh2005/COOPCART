import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { PaymentMethod, PaymentStatus } from "@/lib/types";

export interface AdminPaymentRow {
  payment_id: string;
  order_id: string;
  order_number: string;
  business_name: string;
  method: PaymentMethod;
  status: PaymentStatus;
  amount: number;
  slip_url: string | null;
  uploaded_at: string | null;
  verified_at: string | null;
  reject_reason: string | null;
  placed_at: string;
}

/** Raw joined `payments` row (with the embedded order + business). */
interface RawPayment {
  id: string;
  order_id: string;
  method: PaymentMethod;
  status: PaymentStatus;
  amount: number;
  slip_url: string | null;
  uploaded_at: string | null;
  verified_at: string | null;
  reject_reason: string | null;
  orders: {
    order_number: string;
    placed_at: string;
    businesses: { business_name: string };
  };
}

export async function getPendingPayments(): Promise<AdminPaymentRow[]> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("payments")
    .select(
      `id, order_id, method, status, amount, slip_url, uploaded_at, verified_at, reject_reason,
       orders!inner ( order_number, placed_at, businesses!inner ( business_name ) )`,
    )
    .eq("status", "slip_uploaded")
    .order("uploaded_at", { ascending: true });

  return ((data ?? []) as unknown as RawPayment[]).map((p) => ({
    payment_id: p.id,
    order_id: p.order_id,
    method: p.method,
    status: p.status,
    amount: p.amount,
    slip_url: p.slip_url,
    uploaded_at: p.uploaded_at,
    verified_at: p.verified_at,
    reject_reason: p.reject_reason,
    order_number: p.orders.order_number,
    placed_at: p.orders.placed_at,
    business_name: p.orders.businesses.business_name,
  }));
}

export async function getAllPayments(
  status?: PaymentStatus,
  limit = 100,
): Promise<AdminPaymentRow[]> {
  const supabase = await createSupabaseServerClient();
  let q = supabase
    .from("payments")
    .select(
      `id, order_id, method, status, amount, slip_url, uploaded_at, verified_at, reject_reason,
       orders!inner ( order_number, placed_at, businesses!inner ( business_name ) )`,
    )
    .order("created_at", { ascending: false })
    .limit(limit);
  if (status) q = q.eq("status", status);
  const { data } = await q;
  return ((data ?? []) as unknown as RawPayment[]).map((p) => ({
    payment_id: p.id,
    order_id: p.order_id,
    method: p.method,
    status: p.status,
    amount: p.amount,
    slip_url: p.slip_url,
    uploaded_at: p.uploaded_at,
    verified_at: p.verified_at,
    reject_reason: p.reject_reason,
    order_number: p.orders.order_number,
    placed_at: p.orders.placed_at,
    business_name: p.orders.businesses.business_name,
  }));
}

export async function getPaymentSlipUrl(path: string): Promise<string | null> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.storage
    .from("payment-slips")
    .createSignedUrl(path, 3600);
  return data?.signedUrl ?? null;
}
