import { tierRangeLabel } from "@/lib/pricing";
import { formatLKR } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { PriceTier } from "@/lib/types";

export function PriceTiers({ tiers, activeQty }: { tiers: PriceTier[]; activeQty?: number }) {
  const sorted = [...tiers]
    .filter((t) => !t.is_custom_quote)
    .sort((a, b) => a.min_qty_trays - b.min_qty_trays);
  if (sorted.length === 0) return null;

  return (
    <div className="rounded-xl border border-line bg-cream/50 p-3">
      <p className="mb-2 text-xs font-semibold text-brown-800">Bulk pricing · per tray</p>
      <ul className="space-y-0.5 text-xs">
        {sorted.map((t) => {
          const active =
            activeQty != null &&
            activeQty >= t.min_qty_trays &&
            (t.max_qty_trays == null || activeQty <= t.max_qty_trays);
          return (
            <li
              key={t.id}
              className={cn(
                "flex justify-between rounded px-1.5 py-1",
                active && "bg-yolk-200/70",
              )}
            >
              <span className="text-muted">{tierRangeLabel(t)}</span>
              <span className="font-semibold text-brown-800">{formatLKR(t.price_per_tray)}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
