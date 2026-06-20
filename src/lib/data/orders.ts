import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Order, OrderItem, Payment } from "@/lib/types";

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
