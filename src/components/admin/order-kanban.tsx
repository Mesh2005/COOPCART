"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Calendar,
  ChevronRight,
  Truck,
  Store,
} from "lucide-react";
import { setOrderStatusAction } from "@/lib/actions/admin/orders";
import { initialActionState } from "@/lib/actions/state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { ORDER_STATUS_LABELS } from "@/lib/labels";
import { formatLKR, formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { AdminOrderRow } from "@/lib/data/admin/orders";
import type { OrderStatus } from "@/lib/types";

const COLUMNS: { status: OrderStatus; label: string; color: string }[] = [
  { status: "pending", label: "Pending", color: "bg-amber-50 border-amber-200" },
  { status: "confirmed", label: "Confirmed", color: "bg-blue-50 border-blue-200" },
  { status: "packed", label: "Packed", color: "bg-purple-50 border-purple-200" },
  { status: "out_for_delivery", label: "Out / Ready", color: "bg-orange-50 border-orange-200" },
  { status: "delivered", label: "Delivered", color: "bg-green-50 border-green-200" },
];

function nextStatus(order: AdminOrderRow): OrderStatus | null {
  const map: Record<string, OrderStatus> = {
    pending: "confirmed",
    confirmed: "packed",
    packed: order.fulfillment_type === "delivery" ? "out_for_delivery" : "ready_for_pickup",
    out_for_delivery: "delivered",
    ready_for_pickup: "delivered",
  };
  return map[order.status] ?? null;
}

function OrderCard({ order }: { order: AdminOrderRow }) {
  const [state, action, pending] = useActionState(
    setOrderStatusAction,
    initialActionState,
  );
  const next = nextStatus(order);

  return (
    <div className="rounded-xl border border-line bg-white p-3 shadow-sm">
      <div className="flex items-center justify-between gap-1">
        <Link
          href={`/admin/orders/${order.id}`}
          className="font-semibold text-brown-900 hover:text-brown-600 text-sm"
        >
          {order.order_number}
        </Link>
        <span className="text-xs text-muted">
          {order.fulfillment_type === "delivery" ? (
            <Truck className="h-3.5 w-3.5 inline" />
          ) : (
            <Store className="h-3.5 w-3.5 inline" />
          )}
        </span>
      </div>
      <p className="mt-0.5 text-xs text-muted truncate">{order.business_name}</p>
      <p className="mt-1.5 text-sm font-semibold text-brown-800">
        {formatLKR(order.total)}
      </p>
      {order.scheduled_date && (
        <p className="mt-0.5 flex items-center gap-1 text-xs text-muted">
          <Calendar className="h-3 w-3" />
          {formatDate(order.scheduled_date)}
        </p>
      )}
      {state.error && (
        <Alert variant="error" className="mt-2 py-1.5 text-xs">
          {state.error}
        </Alert>
      )}
      {next && (
        <form action={action} className="mt-2">
          <input type="hidden" name="orderId" value={order.id} />
          <input type="hidden" name="newStatus" value={next} />
          <button
            type="submit"
            disabled={pending}
            className="flex w-full items-center justify-center gap-1 rounded-lg bg-brown-50 px-2 py-1 text-xs font-medium text-brown-700 hover:bg-brown-100 disabled:opacity-50"
          >
            {pending ? "Moving…" : (
              <>
                → {ORDER_STATUS_LABELS[next]}
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}

export function OrderKanban({ orders }: { orders: AdminOrderRow[] }) {
  const [showCancelled, setShowCancelled] = useState(false);
  const cancelled = orders.filter((o) => o.status === "cancelled");

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto pb-2">
        <div className="flex gap-4 min-w-max">
          {COLUMNS.map((col) => {
            const colOrders = orders.filter(
              (o) =>
                o.status === col.status ||
                (col.status === "out_for_delivery" &&
                  o.status === "ready_for_pickup"),
            );
            return (
              <div
                key={col.status}
                className={cn(
                  "w-64 flex-shrink-0 rounded-2xl border p-3",
                  col.color,
                )}
              >
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="font-semibold text-brown-900 text-sm">
                    {col.label}
                  </h3>
                  <span className="rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-muted">
                    {colOrders.length}
                  </span>
                </div>
                <div className="space-y-2">
                  {colOrders.length === 0 && (
                    <p className="py-4 text-center text-xs text-muted">
                      No orders
                    </p>
                  )}
                  {colOrders.map((o) => (
                    <OrderCard key={o.id} order={o} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {cancelled.length > 0 && (
        <div>
          <button
            className="text-sm font-medium text-muted hover:text-brown-700"
            onClick={() => setShowCancelled((s) => !s)}
          >
            {showCancelled ? "Hide" : "Show"} cancelled ({cancelled.length})
          </button>
          {showCancelled && (
            <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {cancelled.map((o) => (
                <Link
                  key={o.id}
                  href={`/admin/orders/${o.id}`}
                  className="rounded-xl border border-line bg-surface p-3 hover:bg-brown-50"
                >
                  <p className="text-sm font-semibold text-muted line-through">
                    {o.order_number}
                  </p>
                  <p className="text-xs text-muted">{o.business_name}</p>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
