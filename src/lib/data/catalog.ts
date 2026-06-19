import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Inventory, PriceTier, Product, ProductPrice } from "@/lib/types";

export type CatalogProduct = Product & {
  base_price: number | null;
  tiers: PriceTier[];
  available: number;
  low_stock: boolean;
  in_cart: number;
};

/** Public catalogue (active products only, no pricing). Resilient to missing env. */
export async function getPublicProducts(): Promise<Product[]> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase
      .from("products")
      .select("*")
      .eq("is_active", true)
      .order("sort_order");
    return (data ?? []) as unknown as Product[];
  } catch {
    return [];
  }
}

/** Full catalogue for an approved customer: products + price + tiers + stock. */
export async function getCatalog(): Promise<CatalogProduct[]> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [products, prices, tiers, inv] = await Promise.all([
    supabase.from("products").select("*").eq("is_active", true).order("sort_order"),
    supabase.from("product_prices").select("*").order("effective_from", { ascending: false }),
    supabase.from("price_tiers").select("*").order("min_qty_trays"),
    supabase.from("inventory").select("*"),
  ]);

  const cart = new Map<string, number>();
  if (user) {
    const { data: items } = await supabase
      .from("cart_items")
      .select("product_id, qty_trays")
      .eq("user_id", user.id);
    for (const it of (items ?? []) as { product_id: string; qty_trays: number }[]) {
      cart.set(it.product_id, it.qty_trays);
    }
  }

  const latestPrice = new Map<string, number>();
  for (const p of (prices.data ?? []) as unknown as ProductPrice[]) {
    if (!latestPrice.has(p.product_id)) latestPrice.set(p.product_id, Number(p.price_per_tray));
  }

  const tiersByProduct = new Map<string, PriceTier[]>();
  for (const t of (tiers.data ?? []) as unknown as PriceTier[]) {
    const arr = tiersByProduct.get(t.product_id) ?? [];
    arr.push(t);
    tiersByProduct.set(t.product_id, arr);
  }

  const invByProduct = new Map<string, Inventory>();
  for (const i of (inv.data ?? []) as unknown as Inventory[]) invByProduct.set(i.product_id, i);

  return ((products.data ?? []) as unknown as Product[]).map((p) => {
    const stock = invByProduct.get(p.id);
    const available = stock ? Math.max(stock.trays_on_hand - stock.trays_reserved, 0) : 0;
    return {
      ...p,
      base_price: latestPrice.get(p.id) ?? null,
      tiers: tiersByProduct.get(p.id) ?? [],
      available,
      low_stock: stock ? available <= stock.low_stock_threshold : false,
      in_cart: cart.get(p.id) ?? 0,
    };
  });
}
