import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { ORDER_STATUS_LABELS } from "@/lib/labels";
import type { FulfillmentType, OrderStatus } from "@/lib/types";

export function OrderTimeline({
  status,
  fulfillment,
}: {
  status: OrderStatus;
  fulfillment: FulfillmentType;
}) {
  if (status === "cancelled") {
    return (
      <div className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm font-medium text-danger">
        This order was cancelled.
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
  const currentIdx = steps.indexOf(normalized);

  return (
    <ol className="space-y-3">
      {steps.map((s, i) => {
        const done = currentIdx >= 0 && i <= currentIdx;
        return (
          <li key={s} className="flex items-center gap-3">
            <span
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold",
                done ? "bg-sage-500 text-white" : "border border-line bg-surface text-muted",
              )}
            >
              {done ? <Check className="h-4 w-4" /> : i + 1}
            </span>
            <span className={cn("text-sm", done ? "font-semibold text-brown-900" : "text-muted")}>
              {ORDER_STATUS_LABELS[s]}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
