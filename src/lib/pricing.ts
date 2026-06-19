import type { PriceTier } from "@/lib/types";

/** Find the bulk tier that applies to a quantity (highest matching min). */
export function resolveTier(tiers: PriceTier[], qty: number): PriceTier | null {
  let best: PriceTier | null = null;
  for (const t of tiers) {
    if (t.is_custom_quote) continue;
    if (qty < t.min_qty_trays) continue;
    if (t.max_qty_trays != null && qty > t.max_qty_trays) continue;
    if (!best || t.min_qty_trays > best.min_qty_trays) best = t;
  }
  return best;
}

/** Per-tray price for a quantity (tier price, else base price). */
export function unitPriceForQty(
  tiers: PriceTier[],
  basePrice: number | null,
  qty: number,
): number {
  const tier = resolveTier(tiers, qty);
  if (tier) return Number(tier.price_per_tray);
  return basePrice != null ? Number(basePrice) : 0;
}

/** Human label for a tier range, e.g. "10–24 trays" or "50+ trays". */
export function tierRangeLabel(tier: PriceTier): string {
  return tier.max_qty_trays != null
    ? `${tier.min_qty_trays}–${tier.max_qty_trays} trays`
    : `${tier.min_qty_trays}+ trays`;
}
