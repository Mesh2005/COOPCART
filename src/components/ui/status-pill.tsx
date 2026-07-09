import { cn } from "@/lib/utils";
import { ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS } from "@/lib/labels";
import type { OrderStatus, PaymentStatus } from "@/lib/types";

const ORDER_STYLES: Record<OrderStatus, string> = {
  pending: "bg-amber-100 text-amber-700",
  confirmed: "bg-blue-100 text-blue-700",
  packed: "bg-purple-100 text-purple-700",
  out_for_delivery: "bg-orange-100 text-orange-700",
  ready_for_pickup: "bg-teal-100 text-teal-700",
  delivered: "bg-green-100 text-green-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

const PAYMENT_STYLES: Record<PaymentStatus, string> = {
  unpaid: "bg-amber-100 text-amber-700",
  slip_uploaded: "bg-blue-100 text-blue-700",
  verified: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
  paid_cod: "bg-green-100 text-green-700",
};

const base =
  "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold";

export function OrderStatusPill({
  status,
  className,
}: {
  status: OrderStatus;
  className?: string;
}) {
  return (
    <span className={cn(base, ORDER_STYLES[status], className)}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {ORDER_STATUS_LABELS[status]}
    </span>
  );
}

export function PaymentStatusPill({
  status,
  className,
}: {
  status: PaymentStatus;
  className?: string;
}) {
  return (
    <span className={cn(base, PAYMENT_STYLES[status], className)}>
      {PAYMENT_STATUS_LABELS[status]}
    </span>
  );
}
