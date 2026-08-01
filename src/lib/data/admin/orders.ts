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

/** Raw shape of the joined `orders` row as returned by the list query. */
interface RawAdminOrder {
  id: string;
  order_number: string;
  status: OrderStatus;
  fulfillment_type: FulfillmentType;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  total: number;
  scheduled_date: string | null;
  placed_at: string;
  businesses: { business_name: string };
  delivery_zones: { name: string } | null;
}

/** Raw shape of the joined `orders` row as returned by the detail query. */
interface RawAdminOrderDetail extends Omit<RawAdminOrder, never> {
  subtotal: number;
  delivery_fee: number;
  delivery_address: string | null;
  customer_note: string | null;
  internal_note: string | null;
  order_items: AdminOrderDetail["items"];
  payments:
    | {
        id: string;
        status: PaymentStatus;
        slip_url: string | null;
        reject_reason: string | null;
        uploaded_at: string | null;
      }[]
    | null;
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
  // Supabase types the embedded to-one joins as arrays; at runtime they are
  // objects, so cast through unknown to the real row shape.
  return ((data ?? []) as unknown as RawAdminOrder[]).map((o) => ({
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
  const row = o as unknown as RawAdminOrderDetail;
  return {
    id: row.id,
    order_number: row.order_number,
    business_name: row.businesses.business_name,
    status: row.status,
    fulfillment_type: row.fulfillment_type,
    payment_method: row.payment_method,
    payment_status: row.payment_status,
    total: row.total,
    subtotal: row.subtotal,
    delivery_fee: row.delivery_fee,
    scheduled_date: row.scheduled_date,
    placed_at: row.placed_at,
    delivery_address: row.delivery_address,
    customer_note: row.customer_note,
    internal_note: row.internal_note,
    delivery_zone_name: row.delivery_zones?.name ?? null,
    items: row.order_items ?? [],
    payment: row.payments?.[0] ?? null,
  };
}
