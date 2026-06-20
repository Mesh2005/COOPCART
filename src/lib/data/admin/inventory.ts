import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface InventoryRow {
  product_id: string;
  product_name: string;
  size_grade: string;
  is_active: boolean;
  trays_on_hand: number;
  trays_reserved: number;
  trays_available: number;
  low_stock_threshold: number;
  is_low: boolean;
  updated_at: string;
}

export interface StockMovementRow {
  id: string;
  product_name: string;
  movement_type: string;
  trays_delta: number;
  note: string | null;
  created_at: string;
  created_by_name: string | null;
}

export async function getInventory(): Promise<InventoryRow[]> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("inventory")
    .select(
      `product_id, trays_on_hand, trays_reserved, low_stock_threshold, updated_at,
       products!inner ( name, size_grade, is_active )`,
    )
    .order("products(sort_order)");
  return (data ?? []).map((i: any) => ({
    product_id: i.product_id,
    product_name: i.products.name,
    size_grade: i.products.size_grade,
    is_active: i.products.is_active,
    trays_on_hand: i.trays_on_hand,
    trays_reserved: i.trays_reserved,
    trays_available: i.trays_on_hand - i.trays_reserved,
    low_stock_threshold: i.low_stock_threshold,
    is_low: i.trays_on_hand - i.trays_reserved <= i.low_stock_threshold,
    updated_at: i.updated_at,
  }));
}

export async function getStockMovements(
  productId?: string,
  limit = 50,
): Promise<StockMovementRow[]> {
  const supabase = await createSupabaseServerClient();
  let q = supabase
    .from("stock_movements")
    .select(
      `id, movement_type, trays_delta, note, created_at,
       products!inner ( name ),
       profiles ( full_name )`,
    )
    .order("created_at", { ascending: false })
    .limit(limit);
  if (productId) q = q.eq("product_id", productId);
  const { data } = await q;
  return (data ?? []).map((m: any) => ({
    id: m.id,
    product_name: m.products.name,
    movement_type: m.movement_type,
    trays_delta: m.trays_delta,
    note: m.note,
    created_at: m.created_at,
    created_by_name: m.profiles?.full_name ?? null,
  }));
}
