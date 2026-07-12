import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { ORDER_STATUS_LABELS } from "@/lib/labels";
import { formatDate, formatDateTime } from "@/lib/format";
import type { FulfillmentType, OrderStatus } from "@/lib/types";
import type { OrderEvent } from "@/lib/data/orders";

type TimelineEvent = Pick<OrderEvent, "status" | "created_at" | "note">;

export function OrderTimeline({
  status,
  fulfillment,
  events = [],
  scheduledDate,
}: {
  status: OrderStatus;
  fulfillment: FulfillmentType;
  events?: TimelineEvent[];
  scheduledDate?: string | null;
}) {
  if (status === "cancelled") {
    const at = events.find((e) => e.status === "cancelled");
    return (
      <div className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
        <p className="font-semibold">This order was cancelled.</p>
        {at && <p className="mt-0.5 text-xs opacity-80">{formatDateTime(at.created_at)}</p>}
        {at?.note && <p className="mt-1 text-xs opacity-80">Reason: {at.note}</p>}
      </div>
    );
  }

  const steps: OrderStatus[] = [
    "pending",
    "confirmed",
    "packed",
    fulfillment === "delivery" ? "out_for_delivery" : "ready_for_pickup",
    "delivered",
  ];
  const normalized = status === "completed" ? "delivered" : status;
  const statusIdx = steps.indexOf(normalized);

  // Earliest timestamp recorded for a step (delivered also matches completed).
  const tsFor = (s: OrderStatus): string | null => {
    if (s === "delivered") {
      return events.find((e) => e.status === "delivered" || e.status === "completed")?.created_at ?? null;
    }
    return events.find((e) => e.status === s)?.created_at ?? null;
  };

  // Progress: prefer the recorded trail, fall back to the current status.
  const reachedIdx = Math.max(statusIdx, ...steps.map((s, i) => (tsFor(s) ? i : -1)));

  return (
    <ol className="relative">
      {steps.map((s, i) => {
        const ts = tsFor(s);
        const done = i <= reachedIdx;
        const current = i === reachedIdx && reachedIdx < steps.length - 1;
        const last = i === steps.length - 1;
        const isFulfilmentStep =
          s === "out_for_delivery" || s === "ready_for_pickup" || s === "delivered";

        return (
          <li key={s} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span
                className={cn(
                  "flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors",
                  done
                    ? "bg-sage-500 text-white"
                    : current
                      ? "border-2 border-sage-500 bg-surface text-sage-600 ring-4 ring-sage-500/20"
                      : "border border-line bg-surface text-muted",
                )}
              >
                {done ? <Check className="h-4 w-4 animate-scale-in" /> : i + 1}
              </span>
              {!last && (
                <span
                  className={cn(
                    "my-1 w-0.5 flex-1",
                    i < reachedIdx ? "bg-sage-500" : "bg-line",
                  )}
                />
              )}
            </div>

            <div className={cn("min-w-0", last ? "pb-0" : "pb-5")}>
              <p
                className={cn(
                  "flex flex-wrap items-center gap-2 text-sm",
                  done || current ? "font-semibold text-brown-900" : "text-muted",
                )}
              >
                {ORDER_STATUS_LABELS[s]}
                {current && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-sage-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-sage-600">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-sage-500" /> Now
                  </span>
                )}
              </p>
              {ts ? (
                <p className="mt-0.5 text-xs text-muted">{formatDateTime(ts)}</p>
              ) : isFulfilmentStep && scheduledDate && !done ? (
                <p className="mt-0.5 text-xs text-muted">
                  {fulfillment === "delivery" ? "Est. delivery" : "Ready by"}{" "}
                  {formatDate(scheduledDate)}
                </p>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
