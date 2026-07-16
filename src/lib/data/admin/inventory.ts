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
  // Sort in JS by the embedded products.sort_order — PostgREST can't order a
  // parent by an embedded column here ("products(sort_order)" fails to resolve).
  const { data, error } = await supabase
    .from("inventory")
    .select(
      `product_id, trays_on_hand, trays_reserved, low_stock_threshold, updated_at,
       products!inner ( name, size_grade, is_active, sort_order )`,
    );
  if (error) throw new Error(`getInventory: ${error.message}`);
  const rows = (data ?? [])
    .slice()
    .sort((a: any, b: any) => (a.products.sort_order ?? 0) - (b.products.sort_order ?? 0));
  return rows.map((i: any) => ({
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
  // NB: the columns are `type` and `change_trays` (not movement_type/trays_delta).
  let q = supabase
    .from("stock_movements")
    .select(
      `id, type, change_trays, note, created_at, created_by,
       products!inner ( name )`,
    )
    .order("created_at", { ascending: false })
    .limit(limit);
  if (productId) q = q.eq("product_id", productId);
  const { data, error } = await q;
  if (error) throw new Error(`getStockMovements: ${error.message}`);
  const movements = data ?? [];

  // stock_movements.created_by references auth.users, not profiles — resolve
  // the names with a separate lookup rather than a (non-existent) embed.
  const userIds = [
    ...new Set(movements.map((m: any) => m.created_by).filter(Boolean)),
  ];
  const nameMap: Record<string, string | null> = {};
  if (userIds.length > 0) {
    const { data: profs } = await supabase
      .from("profiles")
      .select("id, full_name")
      .in("id", userIds);
    (profs ?? []).forEach((p: any) => (nameMap[p.id] = p.full_name));
  }

  return movements.map((m: any) => ({
    id: m.id,
    product_name: m.products.name,
    movement_type: m.type,
    trays_delta: m.change_trays,
    note: m.note,
    created_at: m.created_at,
    created_by_name: m.created_by ? (nameMap[m.created_by] ?? null) : null,
  }));
}
