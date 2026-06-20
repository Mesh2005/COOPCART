import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Package, Truck } from "lucide-react";
import { getAdminOrderDetail } from "@/lib/data/admin/orders";
import { OrderStatusForm } from "@/components/admin/order-status-form";
import { PageHeader } from "@/components/admin/page-header";
import { Badge } from "@/components/ui/badge";
import { ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS } from "@/lib/labels";
import { formatDate, formatLKR } from "@/lib/format";

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-4 text-sm">
      <dt className="text-muted">{k}</dt>
      <dd className="text-right font-medium text-brown-800">{v}</dd>
    </div>
  );
}

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getAdminOrderDetail(id);
  if (!order) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link
        href="/admin/orders"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-brown-800"
      >
        <ArrowLeft className="h-4 w-4" /> All orders
      </Link>

      <PageHeader title={order.order_number}>
      </PageHeader>

      <div className="flex flex-wrap items-center gap-3">
        <Badge variant="brand">{ORDER_STATUS_LABELS[order.status]}</Badge>
        <Badge variant="neutral">
          {PAYMENT_STATUS_LABELS[order.payment_status]}
        </Badge>
        <span className="text-sm text-muted">
          {order.fulfillment_type === "delivery" ? (
            <><Truck className="mr-1 inline h-3.5 w-3.5" />Delivery</>
          ) : (
            <><Package className="mr-1 inline h-3.5 w-3.5" />Pickup</>
          )}
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-line bg-surface p-5">
          <h2 className="font-display text-base font-semibold text-brown-900">
            Details
          </h2>
          <dl className="mt-3 space-y-1.5">
            <Row k="Business" v={order.business_name} />
            <Row k="Placed" v={formatDate(order.placed_at)} />
            {order.scheduled_date && (
              <Row
                k={order.fulfillment_type === "delivery" ? "Delivery date" : "Pickup date"}
                v={formatDate(order.scheduled_date)}
              />
            )}
            {order.delivery_zone_name && (
              <Row k="Zone" v={order.delivery_zone_name} />
            )}
            {order.delivery_address && (
              <Row k="Address" v={order.delivery_address} />
            )}
            {order.customer_note && (
              <Row k="Customer note" v={order.customer_note} />
            )}
          </dl>
        </div>

        <OrderStatusForm order={order} />
      </div>

      <div className="rounded-2xl border border-line bg-surface p-5">
        <h2 className="font-display text-base font-semibold text-brown-900">
          Items
        </h2>
        <ul className="mt-3 divide-y divide-line">
          {order.items.map((it) => (
            <li
              key={it.id}
              className="flex items-center justify-between gap-3 py-2.5 text-sm"
            >
              <span>
                <span className="font-medium text-brown-900">
                  {it.product_name_snapshot}
                </span>{" "}
                <span className="text-muted">
                  × {it.qty_trays} · {formatLKR(it.unit_price_snapshot)}/tray
                </span>
              </span>
              <span className="font-medium text-brown-800">
                {formatLKR(it.line_total)}
              </span>
            </li>
          ))}
        </ul>
        <dl className="mt-3 space-y-1.5 border-t border-line pt-3 text-sm">
          <Row k="Subtotal" v={formatLKR(order.subtotal)} />
          <Row
            k="Delivery fee"
            v={order.delivery_fee > 0 ? formatLKR(order.delivery_fee) : "Free"}
          />
          <div className="flex justify-between pt-1 text-base font-semibold text-brown-900">
            <dt>Total</dt>
            <dd>{formatLKR(order.total)}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
