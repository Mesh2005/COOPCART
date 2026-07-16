import { AlertTriangle, Boxes } from "lucide-react";
import { getInventory, getStockMovements } from "@/lib/data/admin/inventory";
import { ProductionForm } from "@/components/admin/production-form";
import { PageHeader } from "@/components/admin/page-header";
import { Badge } from "@/components/ui/badge";
import { SIZE_GRADE_LABELS } from "@/lib/labels";
import { formatDate } from "@/lib/format";
import type { SizeGrade } from "@/lib/types";

export default async function AdminInventoryPage() {
  const [inventory, movements] = await Promise.all([
    getInventory(),
    getStockMovements(undefined, 30),
  ]);

  const activeProducts = inventory.filter((i) => i.is_active);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Inventory"
        description="Stock levels and daily production."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {inventory.map((row) => (
          <div
            key={row.product_id}
            className="rounded-2xl border border-line bg-surface p-5"
          >
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="font-semibold text-brown-900">{row.product_name}</p>
                <p className="text-xs text-muted">
                  {SIZE_GRADE_LABELS[row.size_grade as SizeGrade]}
                </p>
              </div>
              {row.is_low && (
                <span className="flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
                  <AlertTriangle className="h-3 w-3" /> Low
                </span>
              )}
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center text-sm">
              <div className="rounded-lg bg-brown-50 p-2">
                <p className="text-xl font-bold text-brown-900">
                  {row.trays_on_hand}
                </p>
                <p className="text-xs text-muted">On hand</p>
              </div>
              <div className="rounded-lg bg-brown-50 p-2">
                <p className="text-xl font-bold text-brown-600">
                  {row.trays_reserved}
                </p>
                <p className="text-xs text-muted">Reserved</p>
              </div>
              <div className="rounded-lg bg-brown-50 p-2">
                <p className="text-xl font-bold text-sage-600">
                  {row.trays_available}
                </p>
                <p className="text-xs text-muted">Available</p>
              </div>
            </div>
            <p className="mt-2 text-right text-xs text-muted">
              Threshold: {row.low_stock_threshold} · Updated{" "}
              {formatDate(row.updated_at)}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="rounded-2xl border border-line bg-surface p-6">
          <h2 className="mb-4 font-display text-lg font-semibold text-brown-900">
            Record production
          </h2>
          <ProductionForm products={activeProducts.map((p) => ({ id: p.product_id, name: p.product_name }))} />
        </div>

        <div className="rounded-2xl border border-line bg-surface p-6">
          <h2 className="mb-4 font-display text-lg font-semibold text-brown-900">
            Recent movements
          </h2>
          {movements.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted">
              <Boxes className="h-10 w-10 text-brown-400" />
              <p className="mt-3 text-sm">No movements yet.</p>
            </div>
          ) : (
            <ul className="divide-y divide-line text-sm">
              {movements.map((m) => (
                <li key={m.id} className="flex items-start justify-between gap-3 py-2.5">
                  <div>
                    <p className="font-medium text-brown-900">{m.product_name}</p>
                    <p className="text-xs capitalize text-muted">
                      {m.movement_type.replace("_", " ")}
                      {m.note ? ` · ${m.note}` : ""}
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={
                        m.trays_delta > 0
                          ? "font-semibold text-sage-600"
                          : "font-semibold text-red-600"
                      }
                    >
                      {m.trays_delta > 0 ? "+" : ""}
                      {m.trays_delta}
                    </span>
                    <p className="text-xs text-muted">{formatDate(m.created_at)}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
