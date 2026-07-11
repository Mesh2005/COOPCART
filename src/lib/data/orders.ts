import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Order, OrderItem, OrderStatus, Payment } from "@/lib/types";

export type OrderEvent = {
  id: string;
  order_id: string;
  status: OrderStatus;
  note: string | null;
  created_at: string;
};

/**
 * The timestamped status trail for an order, oldest first. Degrades to an
 * empty list if the order_events table isn't present yet (pre-migration), so
 * the tracker falls back to deriving progress from the current status.
 */
export async function getOrderEvents(orderId: string): Promise<OrderEvent[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("order_events")
    .select("id, order_id, status, note, created_at")
    .eq("order_id", orderId)
    .order("created_at", { ascending: true });
  if (error) return [];
  return (data ?? []) as unknown as OrderEvent[];
}

export async function getMyOrders(): Promise<Order[]> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.from("orders").select("*").order("placed_at", { ascending: false });
  return (data ?? []) as unknown as Order[];
}

export type OrderDetail = { order: Order; items: OrderItem[]; payment: Payment | null };

export async function getOrderById(id: string): Promise<OrderDetail | null> {
  const supabase = await createSupabaseServerClient();
  const { data: order } = await supabase.from("orders").select("*").eq("id", id).maybeSingle();
  if (!order) return null;

  const [{ data: items }, { data: payment }] = await Promise.all([
    supabase.from("order_items").select("*").eq("order_id", id),
    supabase.from("payments").select("*").eq("order_id", id).maybeSingle(),
  ]);

  return {
    order: order as unknown as Order,
    items: (items ?? []) as unknown as OrderItem[],
    payment: (payment as Payment | null) ?? null,
  };
}

/** A signed URL for a private payment slip (1 hour). */
export async function getSlipSignedUrl(path: string): Promise<string | null> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.storage.from("payment-slips").createSignedUrl(path, 3600);
  return data?.signedUrl ?? null;
}
