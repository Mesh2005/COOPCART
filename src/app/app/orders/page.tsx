import Link from "next/link";
import { ClipboardList } from "lucide-react";
import { getMyOrders } from "@/lib/data/orders";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { ORDER_STATUS_LABELS } from "@/lib/labels";
import { formatDate, formatLKR } from "@/lib/format";
import { cn } from "@/lib/utils";

export default async function OrdersPage() {
  const orders = await getMyOrders();

  if (orders.length === 0) {
    return (
      <div className="rounded-3xl border border-line bg-surface p-12 text-center">
        <ClipboardList className="mx-auto h-10 w-10 text-brown-300" />
        <p className="mt-4 font-semibold text-brown-900">No orders yet</p>
        <p className="mt-1 text-sm text-muted">When you place an order, it’ll show up here.</p>
        <Link href="/app/catalog" className={cn(buttonVariants(), "mt-6")}>
          Browse catalogue
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl text-brown-900">Your orders</h1>
      <div className="space-y-3">
        {orders.map((o) => (
          <Link
            key={o.id}
            href={`/app/orders/${o.id}`}
            className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-surface p-4 transition-shadow hover:shadow-sm"
          >
            <div>
              <p className="font-semibold text-brown-900">{o.order_number}</p>
              <p className="text-xs text-muted">
                {formatDate(o.placed_at)} · {o.fulfillment_type === "delivery" ? "Delivery" : "Pickup"}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Badge>{ORDER_STATUS_LABELS[o.status]}</Badge>
              <span className="font-semibold text-brown-900">{formatLKR(o.total)}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
