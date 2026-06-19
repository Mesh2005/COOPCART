import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { getMyBusiness } from "@/lib/auth";
import { getCatalog } from "@/lib/data/catalog";
import { getAppSettings } from "@/lib/data/settings";
import { AddToCart } from "@/components/catalog/add-to-cart";
import { PriceTiers } from "@/components/catalog/price-tiers";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { SIZE_GRADE_LABELS } from "@/lib/labels";
import { formatLKR } from "@/lib/format";
import { cn } from "@/lib/utils";

export default async function CatalogPage() {
  const business = await getMyBusiness();

  if (!business || business.status !== "approved") {
    return (
      <div className="mx-auto max-w-xl rounded-2xl border border-warning/30 bg-warning/10 p-6 text-center">
        <p className="font-semibold text-brown-900">Catalogue locked</p>
        <p className="mt-1 text-sm text-muted">
          Wholesale pricing and ordering unlock once your business account is approved.
        </p>
      </div>
    );
  }

  const [products, settings] = await Promise.all([getCatalog(), getAppSettings()]);
  const minOrder = settings?.min_order_trays ?? 5;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl text-brown-900">Catalogue</h1>
          <p className="mt-1 text-sm text-muted">
            Sold by the tray of 30 · minimum order {minOrder} trays.
          </p>
        </div>
        <Link href="/app/cart" className={cn(buttonVariants({ variant: "secondary" }))}>
          <ShoppingCart className="h-4 w-4" /> View cart
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {products.map((p) => (
          <div key={p.id} className="flex flex-col rounded-3xl border border-line bg-surface p-6">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h2 className="text-lg text-brown-900">{p.name}</h2>
                <p className="text-xs text-muted">
                  {SIZE_GRADE_LABELS[p.size_grade]}
                  {p.weight_min_g != null ? ` · ${p.weight_min_g}–${p.weight_max_g} g` : ""}
                </p>
              </div>
              {p.low_stock && p.available > 0 && <Badge variant="accent">Low stock</Badge>}
            </div>

            <p className="mt-2 text-2xl font-semibold text-brown-900">
              {p.base_price != null ? formatLKR(p.base_price) : "—"}
              <span className="text-sm font-normal text-muted"> / tray</span>
            </p>

            <div className="mt-4">
              <PriceTiers tiers={p.tiers} activeQty={p.in_cart || undefined} />
            </div>

            <div className="mt-auto pt-5">
              <AddToCart
                productId={p.id}
                available={p.available}
                tiers={p.tiers}
                basePrice={p.base_price}
                initialQty={p.in_cart}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
