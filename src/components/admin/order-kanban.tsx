"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Calendar, GripVertical, Store, Truck } from "lucide-react";
import { setOrderStatusAction } from "@/lib/actions/admin/orders";
import { initialActionState } from "@/lib/actions/state";
import { toast } from "@/components/ui/toaster";
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

const TERMINAL: OrderStatus[] = ["delivered", "completed", "cancelled"];

/** The concrete status to set when a card is dropped in a column. */
function targetStatus(col: OrderStatus, order: AdminOrderRow): OrderStatus {
  if (col === "out_for_delivery") {
    return order.fulfillment_type === "delivery" ? "out_for_delivery" : "ready_for_pickup";
  }
  return col;
}

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

function OrderCard({
  order,
  onDragStart,
  onDragEnd,
  dragging,
}: {
  order: AdminOrderRow;
  onDragStart: (id: string) => void;
  onDragEnd: () => void;
  dragging: boolean;
}) {
  const [state, action, pending] = useActionState(setOrderStatusAction, initialActionState);
  const next = nextStatus(order);
  const draggable = !TERMINAL.includes(order.status);

  return (
    <div
      draggable={draggable}
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = "move";
        onDragStart(order.id);
      }}
      onDragEnd={onDragEnd}
      className={cn(
        "group rounded-xl border border-line bg-white p-3 shadow-sm transition-opacity",
        draggable && "cursor-grab active:cursor-grabbing",
        dragging && "opacity-40",
      )}
    >
      <div className="flex items-center justify-between gap-1">
        <div className="flex min-w-0 items-center gap-1">
          {draggable && (
            <GripVertical className="h-3.5 w-3.5 flex-shrink-0 text-brown-300 group-hover:text-brown-400" />
          )}
          <Link
            href={`/admin/orders/${order.id}`}
            className="truncate text-sm font-semibold text-brown-900 hover:text-brown-600"
          >
            {order.order_number}
          </Link>
        </div>
        <span className="text-xs text-muted">
          {order.fulfillment_type === "delivery" ? (
            <Truck className="inline h-3.5 w-3.5" />
          ) : (
            <Store className="inline h-3.5 w-3.5" />
          )}
        </span>
      </div>
      <p className="mt-0.5 truncate text-xs text-muted">{order.business_name}</p>
      <p className="mt-1.5 text-sm font-semibold text-brown-800">{formatLKR(order.total)}</p>
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
            {pending ? "Moving…" : <>→ {ORDER_STATUS_LABELS[next]}</>}
          </button>
        </form>
      )}
    </div>
  );
}

export function OrderKanban({ orders }: { orders: AdminOrderRow[] }) {
  const router = useRouter();
  const [items, setItems] = useState(orders);
  const [dragId, setDragId] = useState<string | null>(null);
  const [overCol, setOverCol] = useState<OrderStatus | null>(null);
  const [showCancelled, setShowCancelled] = useState(false);
  const [, startTransition] = useTransition();

  // Re-sync when the server sends fresh data (after a move refreshes).
  useEffect(() => setItems(orders), [orders]);

  const cancelled = items.filter((o) => o.status === "cancelled");

  function move(order: AdminOrderRow, col: OrderStatus) {
    const newStatus = targetStatus(col, order);
    if (newStatus === order.status) return;
    // Optimistic move.
    setItems((prev) => prev.map((o) => (o.id === order.id ? { ...o, status: newStatus } : o)));
    const fd = new FormData();
    fd.set("orderId", order.id);
    fd.set("newStatus", newStatus);
    startTransition(async () => {
      const res = await setOrderStatusAction(initialActionState, fd);
      if (res?.error) {
        toast(res.error, "error");
      } else {
        toast(`${order.order_number} → ${ORDER_STATUS_LABELS[newStatus]}`, "success");
      }
      router.refresh();
    });
  }

  function handleDrop(col: OrderStatus) {
    setOverCol(null);
    const order = items.find((o) => o.id === dragId);
    setDragId(null);
    if (order) move(order, col);
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted">
        Tip: drag a card between columns to update its status, or use the button on each card.
      </p>
      <div className="overflow-x-auto pb-2">
        <div className="flex min-w-max gap-4">
          {COLUMNS.map((col) => {
            const colOrders = items.filter(
              (o) =>
                o.status === col.status ||
                (col.status === "out_for_delivery" && o.status === "ready_for_pickup"),
            );
            return (
              <div
                key={col.status}
                onDragOver={(e) => {
                  e.preventDefault();
                  setOverCol(col.status);
                }}
                onDragLeave={() => setOverCol((c) => (c === col.status ? null : c))}
                onDrop={() => handleDrop(col.status)}
                className={cn(
                  "w-64 flex-shrink-0 rounded-2xl border p-3 transition-all",
                  col.color,
                  overCol === col.status && "ring-2 ring-brown-400 ring-offset-1",
                )}
              >
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-brown-900">{col.label}</h3>
                  <span className="rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-muted">
                    {colOrders.length}
                  </span>
                </div>
                <div className="min-h-[60px] space-y-2">
                  {colOrders.length === 0 && (
                    <p className="rounded-lg border border-dashed border-line/70 py-4 text-center text-xs text-muted">
                      Drop here
                    </p>
                  )}
                  {colOrders.map((o) => (
                    <OrderCard
                      key={o.id}
                      order={o}
                      dragging={dragId === o.id}
                      onDragStart={setDragId}
                      onDragEnd={() => {
                        setDragId(null);
                        setOverCol(null);
                      }}
                    />
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
                  <p className="text-sm font-semibold text-muted line-through">{o.order_number}</p>
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
