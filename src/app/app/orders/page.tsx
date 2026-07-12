import Link from "next/link";
import { ClipboardList } from "lucide-react";
import { getMyOrders } from "@/lib/data/orders";
import { OrderStatusPill } from "@/components/ui/status-pill";
import { OrderMiniProgress } from "@/components/orders/order-mini-progress";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate, formatLKR } from "@/lib/format";

export default async function OrdersPage() {
  const orders = await getMyOrders();

  if (orders.length === 0) {
    return (
      <EmptyState
        icon={ClipboardList}
        title="No orders yet"
        description="When you place an order, it’ll show up here with live tracking."
        action={{ label: "Browse catalogue", href: "/app/catalog" }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl text-brown-900">Your orders</h1>
      <div className="stagger space-y-3">
        {orders.map((o) => (
          <Link
            key={o.id}
            href={`/app/orders/${o.id}`}
            className="card-hover flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-surface p-4"
          >
            <div>
              <p className="font-semibold text-brown-900">{o.order_number}</p>
              <p className="text-xs text-muted">
                {formatDate(o.placed_at)} · {o.fulfillment_type === "delivery" ? "Delivery" : "Pickup"}
              </p>
              <div className="mt-2">
                <OrderMiniProgress status={o.status} fulfillment={o.fulfillment_type} />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <OrderStatusPill status={o.status} />
              <span className="font-semibold text-brown-900">{formatLKR(o.total)}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
