import { cn } from "@/lib/utils";
import type { FulfillmentType, OrderStatus } from "@/lib/types";

/** A compact 5-segment progress bar for order lists. */
export function OrderMiniProgress({
  status,
  fulfillment,
}: {
  status: OrderStatus;
  fulfillment: FulfillmentType;
}) {
  if (status === "cancelled") {
    return <span className="text-xs font-medium text-red-600">Cancelled</span>;
  }

  const steps: OrderStatus[] = [
    "pending",
    "confirmed",
    "packed",
    fulfillment === "delivery" ? "out_for_delivery" : "ready_for_pickup",
    "delivered",
  ];
  const normalized = status === "completed" ? "delivered" : status;
  const idx = steps.indexOf(normalized);

  return (
    <div
      className="flex items-center gap-1"
      role="progressbar"
      aria-valuenow={idx + 1}
      aria-valuemin={1}
      aria-valuemax={steps.length}
    >
      {steps.map((s, i) => (
        <span
          key={s}
          className={cn("h-1.5 w-6 rounded-full", i <= idx ? "bg-sage-500" : "bg-line")}
        />
      ))}
    </div>
  );
}
