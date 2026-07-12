"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, ShoppingCart } from "lucide-react";
import { QuantityStepper } from "@/components/ui/quantity-stepper";
import { Button } from "@/components/ui/button";
import { setCartQty } from "@/lib/actions/cart";
import { unitPriceForQty } from "@/lib/pricing";
import { formatLKR } from "@/lib/format";
import type { PriceTier } from "@/lib/types";

export function AddToCart({
  productId,
  available,
  tiers,
  basePrice,
  initialQty,
}: {
  productId: string;
  available: number;
  tiers: PriceTier[];
  basePrice: number | null;
  initialQty: number;
}) {
  const router = useRouter();
  const [qty, setQty] = useState(initialQty > 0 ? initialQty : 1);
  const [pending, start] = useTransition();
  const [done, setDone] = useState(false);

  if (available <= 0) {
    return <p className="text-sm font-semibold text-danger">Out of stock</p>;
  }

  const unit = unitPriceForQty(tiers, basePrice, qty);
  const inCart = initialQty > 0;

  function submit() {
    setDone(false);
    start(async () => {
      const res = await setCartQty(productId, qty);
      if (res.ok) {
        setDone(true);
        router.refresh();
        setTimeout(() => setDone(false), 2000);
      }
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <QuantityStepper value={qty} onChange={setQty} min={1} max={available} />
        <div className="text-right">
          <p className="text-xs text-muted">{formatLKR(unit)} / tray</p>
          <p className="text-sm font-semibold text-brown-900">{formatLKR(unit * qty)}</p>
        </div>
      </div>
      <Button type="button" onClick={submit} loading={pending} className="w-full">
        {done ? (
          <>
            <Check className="h-4 w-4" /> {inCart ? "Updated" : "Added"}
          </>
        ) : pending ? (
          inCart ? "Updating…" : "Adding…"
        ) : (
          <>
            <ShoppingCart className="h-4 w-4" /> {inCart ? "Update cart" : "Add to cart"}
          </>
        )}
      </Button>
      <p className="text-center text-xs text-muted">{available} trays available</p>
    </div>
  );
}
