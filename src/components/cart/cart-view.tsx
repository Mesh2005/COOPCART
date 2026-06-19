"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, ShoppingCart, Trash2 } from "lucide-react";
import { QuantityStepper } from "@/components/ui/quantity-stepper";
import { buttonVariants } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { removeFromCart, setCartQty } from "@/lib/actions/cart";
import { unitPriceForQty } from "@/lib/pricing";
import { formatLKR } from "@/lib/format";
import { SIZE_GRADE_LABELS } from "@/lib/labels";
import { cn } from "@/lib/utils";
import type { CartLine } from "@/lib/data/cart";

export function CartView({ initialLines, minOrder }: { initialLines: CartLine[]; minOrder: number }) {
  const router = useRouter();
  const [lines, setLines] = useState(initialLines);
  const [, start] = useTransition();

  function priceFor(line: CartLine, qty: number) {
    return unitPriceForQty(line.tiers, line.base_price, qty);
  }

  function updateQty(line: CartLine, qty: number) {
    setLines((prev) =>
      prev.map((l) =>
        l.id === line.id
          ? { ...l, qty, unit_price: priceFor(l, qty), line_total: priceFor(l, qty) * qty }
          : l,
      ),
    );
    start(async () => {
      await setCartQty(line.product_id, qty);
      router.refresh();
    });
  }

  function remove(line: CartLine) {
    setLines((prev) => prev.filter((l) => l.id !== line.id));
    start(async () => {
      await removeFromCart(line.product_id);
      router.refresh();
    });
  }

  const totalTrays = lines.reduce((s, l) => s + l.qty, 0);
  const subtotal = lines.reduce((s, l) => s + priceFor(l, l.qty) * l.qty, 0);
  const belowMin = totalTrays < minOrder;

  if (lines.length === 0) {
    return (
      <div className="rounded-3xl border border-line bg-surface p-12 text-center">
        <ShoppingCart className="mx-auto h-10 w-10 text-brown-300" />
        <p className="mt-4 font-semibold text-brown-900">Your cart is empty</p>
        <p className="mt-1 text-sm text-muted">Add some trays from the catalogue to get started.</p>
        <Link href="/app/catalog" className={cn(buttonVariants(), "mt-6")}>
          Browse catalogue
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-4">
        {lines.map((line) => (
          <div
            key={line.id}
            className="flex flex-wrap items-center gap-4 rounded-2xl border border-line bg-surface p-4 sm:flex-nowrap"
          >
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-brown-900">{line.name}</p>
              <p className="text-xs text-muted">
                {SIZE_GRADE_LABELS[line.grade]}
                {line.weight ? ` · ${line.weight}` : ""} · {formatLKR(priceFor(line, line.qty))}/tray
              </p>
            </div>
            <QuantityStepper
              value={line.qty}
              onChange={(n) => updateQty(line, n)}
              min={1}
              max={Math.max(line.available, line.qty)}
            />
            <p className="w-24 text-right font-semibold text-brown-900">
              {formatLKR(priceFor(line, line.qty) * line.qty)}
            </p>
            <button
              type="button"
              onClick={() => remove(line)}
              aria-label="Remove"
              className="flex h-9 w-9 items-center justify-center rounded-full text-muted hover:bg-danger/10 hover:text-danger"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      <aside className="h-fit rounded-2xl border border-line bg-surface p-6 lg:sticky lg:top-6">
        <h2 className="font-display text-lg font-semibold text-brown-900">Order summary</h2>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted">Total trays</dt>
            <dd className="font-medium text-brown-800">{totalTrays}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted">Subtotal</dt>
            <dd className="font-medium text-brown-800">{formatLKR(subtotal)}</dd>
          </div>
          <div className="flex justify-between border-t border-line pt-2 text-xs text-muted">
            <dt>Delivery fee</dt>
            <dd>Calculated at checkout</dd>
          </div>
        </dl>

        {belowMin && (
          <Alert variant="info" className="mt-4">
            Minimum order is {minOrder} trays. Add {minOrder - totalTrays} more to check out.
          </Alert>
        )}

        <Link
          href="/app/checkout"
          aria-disabled={belowMin}
          tabIndex={belowMin ? -1 : undefined}
          className={cn(
            buttonVariants(),
            "mt-5 w-full",
            belowMin && "pointer-events-none opacity-50",
          )}
        >
          Proceed to checkout <ArrowRight className="h-4 w-4" />
        </Link>
        <Link
          href="/app/catalog"
          className={cn(buttonVariants({ variant: "ghost" }), "mt-2 w-full")}
        >
          Continue shopping
        </Link>
      </aside>
    </div>
  );
}
