import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { EggColor, SizeGrade } from "@/lib/types";

export interface AdminProduct {
  id: string;
  name: string;
  egg_color: EggColor;
  size_grade: SizeGrade;
  weight_min_g: number | null;
  weight_max_g: number | null;
  description: string | null;
  eggs_per_tray: number;
  sort_order: number;
  is_active: boolean;
  current_price: number | null;
  tiers: {
    id: string;
    min_qty_trays: number;
    max_qty_trays: number | null;
    price_per_tray: number;
    is_custom_quote: boolean;
  }[];
  inventory: {
    trays_on_hand: number;
    trays_reserved: number;
    low_stock_threshold: number;
  } | null;
}

/** Raw `inventory` row used to attach stock levels to a product. */
interface RawInventoryRow {
  product_id: string;
  trays_on_hand: number;
  trays_reserved: number;
  low_stock_threshold: number;
}

export async function getAdminProducts(): Promise<AdminProduct[]> {
  const supabase = await createSupabaseServerClient();
  const { data: products } = await supabase
    .from("products")
    .select("*")
    .order("sort_order");

  if (!products?.length) return [];

  const ids = products.map((p) => p.id);

  const [{ data: prices }, { data: tiers }, { data: inv }] = await Promise.all([
    supabase
      .from("product_prices")
      .select("product_id, price_per_tray")
      .in("product_id", ids)
      .order("effective_from", { ascending: false }),
    supabase
      .from("price_tiers")
      .select("*")
      .in("product_id", ids)
      .order("min_qty_trays"),
    supabase.from("inventory").select("*").in("product_id", ids),
  ]);

  const latestPrice: Record<string, number> = {};
  (prices ?? []).forEach((p: { product_id: string; price_per_tray: number }) => {
    if (!(p.product_id in latestPrice)) latestPrice[p.product_id] = p.price_per_tray;
  });

  const tierMap: Record<string, AdminProduct["tiers"]> = {};
  (tiers ?? []).forEach(
    (t: {
      product_id: string;
      id: string;
      min_qty_trays: number;
      max_qty_trays: number | null;
      price_per_tray: number;
      is_custom_quote: boolean;
    }) => {
      (tierMap[t.product_id] ??= []).push({
        id: t.id,
        min_qty_trays: t.min_qty_trays,
        max_qty_trays: t.max_qty_trays,
        price_per_tray: t.price_per_tray,
        is_custom_quote: t.is_custom_quote,
      });
    },
  );

  const invMap: Record<string, RawInventoryRow> = {};
  (inv ?? []).forEach((i: RawInventoryRow) => (invMap[i.product_id] = i));

  return products.map((p) => ({
    id: p.id,
    name: p.name,
    egg_color: p.egg_color,
    size_grade: p.size_grade,
    weight_min_g: p.weight_min_g,
    weight_max_g: p.weight_max_g,
    description: p.description,
    eggs_per_tray: p.eggs_per_tray,
    sort_order: p.sort_order,
    is_active: p.is_active,
    current_price: latestPrice[p.id] ?? null,
    tiers: tierMap[p.id] ?? [],
    inventory: invMap[p.id]
      ? {
          trays_on_hand: invMap[p.id].trays_on_hand,
          trays_reserved: invMap[p.id].trays_reserved,
          low_stock_threshold: invMap[p.id].low_stock_threshold,
        }
      : null,
  }));
}
