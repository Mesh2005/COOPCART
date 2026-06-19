import { createSupabaseServerClient } from "@/lib/supabase/server";
import { unitPriceForQty } from "@/lib/pricing";
import type { Inventory, PriceTier, Product, ProductPrice, SizeGrade } from "@/lib/types";

export type CartLine = {
  id: string;
  product_id: string;
  name: string;
  grade: SizeGrade;
  weight: string | null;
  qty: number;
  available: number;
  unit_price: number;
  line_total: number;
  base_price: number | null;
  tiers: PriceTier[];
};

export type Cart = { lines: CartLine[]; totalTrays: number; subtotal: number };

type CartRow = { id: string; product_id: string; qty_trays: number; products: Product };

export async function getCart(): Promise<Cart> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { lines: [], totalTrays: 0, subtotal: 0 };

  const { data: items } = await supabase
    .from("cart_items")
    .select("id, product_id, qty_trays, products(*)")
    .eq("user_id", user.id)
    .order("created_at");

  const rows = (items ?? []) as unknown as CartRow[];
  if (rows.length === 0) return { lines: [], totalTrays: 0, subtotal: 0 };

  const productIds = rows.map((r) => r.product_id);
  const [tiersRes, pricesRes, invRes] = await Promise.all([
    supabase.from("price_tiers").select("*").in("product_id", productIds),
    supabase.from("product_prices").select("*").in("product_id", productIds).order("effective_from", { ascending: false }),
    supabase.from("inventory").select("*").in("product_id", productIds),
  ]);

  const tiersBy = new Map<string, PriceTier[]>();
  for (const t of (tiersRes.data ?? []) as unknown as PriceTier[]) {
    const arr = tiersBy.get(t.product_id) ?? [];
    arr.push(t);
    tiersBy.set(t.product_id, arr);
  }
  const priceBy = new Map<string, number>();
  for (const p of (pricesRes.data ?? []) as unknown as ProductPrice[]) {
    if (!priceBy.has(p.product_id)) priceBy.set(p.product_id, Number(p.price_per_tray));
  }
  const invBy = new Map<string, Inventory>();
  for (const i of (invRes.data ?? []) as unknown as Inventory[]) invBy.set(i.product_id, i);

  const lines: CartLine[] = rows.map((r) => {
    const p = r.products;
    const tiers = tiersBy.get(r.product_id) ?? [];
    const base = priceBy.get(r.product_id) ?? null;
    const unit = unitPriceForQty(tiers, base, r.qty_trays);
    const stock = invBy.get(r.product_id);
    const available = stock ? Math.max(stock.trays_on_hand - stock.trays_reserved, 0) : 0;
    return {
      id: r.id,
      product_id: r.product_id,
      name: p.name,
      grade: p.size_grade,
      weight: p.weight_min_g != null ? `${p.weight_min_g}–${p.weight_max_g} g` : null,
      qty: r.qty_trays,
      available,
      unit_price: unit,
      line_total: unit * r.qty_trays,
      base_price: base,
      tiers,
    };
  });

  return {
    lines,
    totalTrays: lines.reduce((s, l) => s + l.qty, 0),
    subtotal: lines.reduce((s, l) => s + l.line_total, 0),
  };
}
