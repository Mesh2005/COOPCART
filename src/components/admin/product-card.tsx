"use client";

import { useActionState, useState } from "react";
import {
  setPriceAction,
  toggleProductAction,
  upsertTierAction,
  deleteTierAction,
} from "@/lib/actions/admin/products";
import { initialActionState } from "@/lib/actions/state";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { formatLKR } from "@/lib/format";
import { SIZE_GRADE_LABELS } from "@/lib/labels";
import { cn } from "@/lib/utils";
import type { AdminProduct } from "@/lib/data/admin/products";
import type { SizeGrade } from "@/lib/types";

export function ProductCard({ product }: { product: AdminProduct }) {
  const [showPriceForm, setShowPriceForm] = useState(false);
  const [showTierForm, setShowTierForm] = useState(false);

  const [priceState, priceAction, pricePending] = useActionState(
    setPriceAction,
    initialActionState,
  );
  const [, toggleAction, togglePending] = useActionState(
    toggleProductAction,
    initialActionState,
  );
  const [tierState, tierAction, tierPending] = useActionState(
    upsertTierAction,
    initialActionState,
  );
  const [, delAction, delPending] = useActionState(
    deleteTierAction,
    initialActionState,
  );

  return (
    <div
      className={cn(
        "rounded-2xl border border-line bg-surface p-5",
        !product.is_active && "opacity-60",
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-display text-lg font-semibold text-brown-900">
              {product.name}
            </h3>
            <Badge variant={product.is_active ? "sage" : "neutral"}>
              {product.is_active ? "Active" : "Inactive"}
            </Badge>
          </div>
          <p className="text-sm text-muted">
            {SIZE_GRADE_LABELS[product.size_grade as SizeGrade]}
            {product.weight_min_g &&
              product.weight_max_g &&
              ` · ${product.weight_min_g}–${product.weight_max_g}g`}
            {" · "}{product.eggs_per_tray} eggs/tray
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-lg font-semibold text-brown-900">
              {product.current_price
                ? `${formatLKR(product.current_price)}/tray`
                : "No price set"}
            </p>
            {product.inventory && (
              <p className="text-xs text-muted">
                {product.inventory.trays_on_hand - product.inventory.trays_reserved} available
              </p>
            )}
          </div>
          <form action={toggleAction}>
            <input type="hidden" name="productId" value={product.id} />
            <input
              type="hidden"
              name="isActive"
              value={(!product.is_active).toString()}
            />
            <Button
              type="submit"
              variant="outline"
              size="sm"
              disabled={togglePending}
            >
              {product.is_active ? "Deactivate" : "Activate"}
            </Button>
          </form>
        </div>
      </div>

      {(priceState.error || priceState.success) && (
        <Alert
          variant={priceState.success ? "success" : "error"}
          className="mt-3"
        >
          {priceState.success || priceState.error}
        </Alert>
      )}

      <div className="mt-4 border-t border-line pt-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-brown-900">
            Bulk price tiers
          </h4>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowPriceForm((s) => !s)}
          >
            Update base price
          </Button>
        </div>

        {showPriceForm && (
          <form action={priceAction} className="mt-3 flex items-end gap-2">
            <input type="hidden" name="productId" value={product.id} />
            <Field label="New base price (LKR/tray)" htmlFor="price" className="flex-1">
              <Input
                id="price"
                name="price"
                type="number"
                min="1"
                step="0.01"
                placeholder="e.g. 850"
                required
              />
            </Field>
            <Button type="submit" disabled={pricePending} className="mb-0.5">
              {pricePending ? "Saving…" : "Save"}
            </Button>
          </form>
        )}

        <div className="mt-3 overflow-hidden rounded-xl border border-line">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line bg-brown-50 text-left text-xs font-semibold text-muted">
                <th className="px-3 py-2">Min trays</th>
                <th className="px-3 py-2">Max trays</th>
                <th className="px-3 py-2">Price / tray</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {product.tiers.map((t) => (
                <tr key={t.id}>
                  <td className="px-3 py-2">{t.min_qty_trays}</td>
                  <td className="px-3 py-2 text-muted">
                    {t.max_qty_trays ?? "∞"}
                  </td>
                  <td className="px-3 py-2 font-medium text-brown-800">
                    {t.is_custom_quote ? "Quote" : formatLKR(t.price_per_tray)}
                  </td>
                  <td className="px-3 py-2 text-right">
                    {!t.is_custom_quote && (
                      <form action={delAction}>
                        <input type="hidden" name="tierId" value={t.id} />
                        <button
                          type="submit"
                          disabled={delPending}
                          className="text-xs text-red-600 hover:underline"
                        >
                          Remove
                        </button>
                      </form>
                    )}
                  </td>
                </tr>
              ))}
              {product.tiers.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-3 py-3 text-center text-xs text-muted"
                  >
                    No tiers configured.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {(tierState.error || tierState.success) && (
          <Alert
            variant={tierState.success ? "success" : "error"}
            className="mt-2"
          >
            {tierState.success || tierState.error}
          </Alert>
        )}

        <button
          type="button"
          className="mt-2 text-xs font-medium text-brown-600 hover:underline"
          onClick={() => setShowTierForm((s) => !s)}
        >
          {showTierForm ? "Cancel" : "+ Add tier"}
        </button>

        {showTierForm && (
          <form action={tierAction} className="mt-3 grid grid-cols-3 gap-2">
            <input type="hidden" name="productId" value={product.id} />
            <Field label="Min qty" htmlFor="minQty">
              <Input id="minQty" name="minQty" type="number" min="1" required />
            </Field>
            <Field label="Max qty" htmlFor="maxQty" hint="Leave blank for ∞">
              <Input id="maxQty" name="maxQty" type="number" min="1" />
            </Field>
            <Field label="Price / tray" htmlFor="tierPrice">
              <Input id="tierPrice" name="tierPrice" type="number" min="1" step="0.01" required />
            </Field>
            <div className="col-span-3">
              <Button type="submit" size="sm" disabled={tierPending}>
                {tierPending ? "Saving…" : "Add tier"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
