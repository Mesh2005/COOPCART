import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { FulfillmentType, OrderStatus, PaymentMethod, PaymentStatus } from "@/lib/types";

export interface AdminOrderRow {
  id: string;
  order_number: string;
  business_name: string;
  status: OrderStatus;
  fulfillment_type: FulfillmentType;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  total: number;
  scheduled_date: string | null;
  placed_at: string;
  delivery_zone_name: string | null;
}

export interface AdminOrderDetail extends AdminOrderRow {
  subtotal: number;
  delivery_fee: number;
  delivery_address: string | null;
  customer_note: string | null;
  internal_note: string | null;
  items: {
    id: string;
    product_name_snapshot: string;
    grade_snapshot: string | null;
    qty_trays: number;
    unit_price_snapshot: number;
    line_total: number;
  }[];
  payment: {
    id: string;
    status: PaymentStatus;
    slip_url: string | null;
    reject_reason: string | null;
    uploaded_at: string | null;
  } | null;
}

export async function getAdminOrders(
  status?: OrderStatus,
  limit = 200,
): Promise<AdminOrderRow[]> {
  const supabase = await createSupabaseServerClient();
  let q = supabase
    .from("orders")
    .select(
      `id, order_number, status, fulfillment_type, payment_method, payment_status,
       total, scheduled_date, placed_at,
       businesses!inner ( business_name ),
       delivery_zones ( name )`,
    )
    .order("placed_at", { ascending: false })
    .limit(limit);
  if (status) q = q.eq("status", status);
  const { data } = await q;
  return (data ?? []).map((o: any) => ({
    id: o.id,
    order_number: o.order_number,
    business_name: o.businesses.business_name,
    status: o.status,
    fulfillment_type: o.fulfillment_type,
    payment_method: o.payment_method,
    payment_status: o.payment_status,
    total: o.total,
    scheduled_date: o.scheduled_date,
    placed_at: o.placed_at,
    delivery_zone_name: o.delivery_zones?.name ?? null,
  }));
}

export async function getAdminOrderDetail(
  id: string,
): Promise<AdminOrderDetail | null> {
  const supabase = await createSupabaseServerClient();
  const { data: o } = await supabase
    .from("orders")
    .select(
      `id, order_number, status, fulfillment_type, payment_method, payment_status,
       total, subtotal, delivery_fee, scheduled_date, placed_at,
       delivery_address, customer_note, internal_note,
       businesses!inner ( business_name ),
       delivery_zones ( name ),
       order_items ( id, product_name_snapshot, grade_snapshot, qty_trays, unit_price_snapshot, line_total ),
       payments ( id, status, slip_url, reject_reason, uploaded_at )`,
    )
    .eq("id", id)
    .single();
  if (!o) return null;
  return {
    id: o.id,
    order_number: o.order_number,
    business_name: (o as any).businesses.business_name,
    status: o.status,
    fulfillment_type: o.fulfillment_type,
    payment_method: o.payment_method,
    payment_status: o.payment_status,
    total: o.total,
    subtotal: (o as any).subtotal,
    delivery_fee: (o as any).delivery_fee,
    scheduled_date: o.scheduled_date,
    placed_at: o.placed_at,
    delivery_address: (o as any).delivery_address,
    customer_note: (o as any).customer_note,
    internal_note: (o as any).internal_note,
    delivery_zone_name: (o as any).delivery_zones?.name ?? null,
    items: (o as any).order_items ?? [],
    payment: ((o as any).payments?.[0]) ?? null,
  };
}
