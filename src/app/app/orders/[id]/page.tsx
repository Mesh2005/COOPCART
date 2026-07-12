import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CircleCheck, Clock, FileText, Package, Store, Truck } from "lucide-react";
import { getOrderById, getOrderEvents, getSlipSignedUrl } from "@/lib/data/orders";
import { getActiveBankAccounts } from "@/lib/data/settings";
import { OrderTimeline } from "@/components/orders/order-timeline";
import { OrderTrackingLive } from "@/components/orders/order-tracking-live";
import { Celebrate } from "@/components/orders/celebrate";
import { FarmMap } from "@/components/orders/farm-map";
import { SlipUpload } from "@/components/orders/slip-upload";
import { Alert } from "@/components/ui/alert";
import { OrderStatusPill } from "@/components/ui/status-pill";
import { ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS } from "@/lib/labels";
import { formatDate, formatLKR } from "@/lib/format";
import type { OrderStatus } from "@/lib/types";

/** Short customer-facing blurb + icon for the tracking summary banner. */
const TRACKING: Record<OrderStatus, { icon: typeof Clock; blurb: string }> = {
  pending: { icon: Clock, blurb: "We’ve received your order and will confirm it shortly." },
  confirmed: { icon: CircleCheck, blurb: "Your order is confirmed and queued for packing." },
  packed: { icon: Package, blurb: "Your trays are packed and ready to go." },
  out_for_delivery: { icon: Truck, blurb: "Your order is on the way." },
  ready_for_pickup: { icon: Store, blurb: "Your order is ready to collect from the farm." },
  delivered: { icon: CircleCheck, blurb: "Delivered. Thank you for your order!" },
  completed: { icon: CircleCheck, blurb: "Completed. Thank you for your order!" },
  cancelled: { icon: Clock, blurb: "This order was cancelled." },
};

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-muted">{k}</dt>
      <dd className="text-right font-medium text-brown-800">{v}</dd>
    </div>
  );
}

export default async function OrderDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ placed?: string }>;
}) {
  const { id } = await params;
  const { placed } = await searchParams;
  const [data, events] = await Promise.all([getOrderById(id), getOrderEvents(id)]);
  if (!data) notFound();

  const { order, items, payment } = data;
  const isBank = order.payment_method === "bank_transfer";
  const isDelivery = order.fulfillment_type === "delivery";
  const track = TRACKING[order.status];
  const TrackIcon = track.icon;
  const isActive = !["delivered", "completed", "cancelled"].includes(order.status);
  const banks = isBank ? await getActiveBankAccounts() : [];
  const bank = banks[0];
  const slipUrl = payment?.slip_url ? await getSlipSignedUrl(payment.slip_url) : null;
  const canUpload =
    isBank && ["unpaid", "slip_uploaded", "rejected"].includes(order.payment_status);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link href="/app/orders" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-brown-800">
        <ArrowLeft className="h-4 w-4" /> All orders
      </Link>

      {placed && <Celebrate />}
      {placed && (
        <Alert variant="success">
          Order placed!{" "}
          {isBank
            ? "Upload your bank transfer slip below to speed up confirmation."
            : "We’ll confirm it shortly."}
        </Alert>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl text-brown-900">{order.order_number}</h1>
          <p className="text-sm text-muted">Placed {formatDate(order.placed_at)}</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={`/app/orders/${order.id}/invoice`}
            className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-xs font-medium text-brown-700 hover:bg-brown-50"
          >
            <FileText className="h-3.5 w-3.5" /> Invoice
          </Link>
          <OrderStatusPill status={order.status} />
        </div>
      </div>

      {order.status !== "cancelled" && (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-sage-500/30 bg-sage-500/5 p-4 sm:p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-sage-500/15 text-sage-600">
              <TrackIcon className="h-5 w-5" />
            </span>
            <div>
              <p className="font-semibold text-brown-900">{ORDER_STATUS_LABELS[order.status]}</p>
              <p className="text-sm text-muted">{track.blurb}</p>
            </div>
          </div>
          {isActive && order.scheduled_date && (
            <div className="sm:text-right">
              <p className="text-xs font-medium uppercase tracking-wide text-muted">
                {isDelivery ? "Estimated delivery" : "Pickup ready by"}
              </p>
              <p className="text-sm font-semibold text-brown-900">
                {formatDate(order.scheduled_date)}
              </p>
            </div>
          )}
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="rounded-2xl border border-line bg-surface p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-brown-900">Progress</h2>
            <OrderTrackingLive orderId={order.id} />
          </div>
          <div className="mt-4">
            <OrderTimeline
              status={order.status}
              fulfillment={order.fulfillment_type}
              events={events}
              scheduledDate={order.scheduled_date}
            />
          </div>
        </div>
        <div className="rounded-2xl border border-line bg-surface p-5">
          <h2 className="font-display text-lg font-semibold text-brown-900">
            {order.fulfillment_type === "delivery" ? "Delivery" : "Pickup"}
          </h2>
          <dl className="mt-3 space-y-1.5 text-sm">
            {order.scheduled_date && <Row k="Date" v={formatDate(order.scheduled_date)} />}
            {order.fulfillment_type === "delivery" && order.delivery_address && (
              <Row k="Address" v={order.delivery_address} />
            )}
            <Row
              k="Payment"
              v={`${isBank ? "Bank transfer" : "Cash on delivery"} · ${PAYMENT_STATUS_LABELS[order.payment_status]}`}
            />
          </dl>
        </div>
      </div>

      {order.status !== "cancelled" && (
        <FarmMap
          label={isDelivery ? "Delivering from Abeyrathna Farms" : "Collect from Abeyrathna Farms"}
        />
      )}

      <div className="rounded-2xl border border-line bg-surface p-5">
        <h2 className="font-display text-lg font-semibold text-brown-900">Items</h2>
        <ul className="mt-3 divide-y divide-line">
          {items.map((it) => (
            <li key={it.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
              <span>
                <span className="font-medium text-brown-900">{it.product_name_snapshot}</span>{" "}
                <span className="text-muted">
                  × {it.qty_trays} · {formatLKR(it.unit_price_snapshot)}/tray
                </span>
              </span>
              <span className="font-medium text-brown-800">{formatLKR(it.line_total)}</span>
            </li>
          ))}
        </ul>
        <dl className="mt-3 space-y-1.5 border-t border-line pt-3 text-sm">
          <Row k="Subtotal" v={formatLKR(order.subtotal)} />
          <Row k="Delivery fee" v={order.delivery_fee > 0 ? formatLKR(order.delivery_fee) : "Free"} />
          <div className="flex justify-between pt-1 text-base font-semibold text-brown-900">
            <dt>Total</dt>
            <dd>{formatLKR(order.total)}</dd>
          </div>
        </dl>
      </div>

      {isBank && (
        <div className="rounded-2xl border border-line bg-surface p-5">
          <h2 className="font-display text-lg font-semibold text-brown-900">Bank transfer</h2>
          {order.payment_status === "verified" ? (
            <Alert variant="success" className="mt-3">Payment verified. Thank you!</Alert>
          ) : (
            <>
              {bank && (
                <div className="mt-3 rounded-xl border border-line bg-cream/50 p-4 text-sm">
                  <dl className="space-y-1">
                    <Row k="Account name" v={bank.account_name} />
                    <Row k="Bank" v={bank.bank_name} />
                    {bank.branch && <Row k="Branch" v={bank.branch} />}
                    <Row k="Account number" v={bank.account_number} />
                    <Row k="Reference" v={order.order_number} />
                  </dl>
                </div>
              )}
              {order.payment_status === "rejected" && (
                <Alert variant="error" className="mt-3">
                  Your previous slip was rejected
                  {payment?.reject_reason ? `: ${payment.reject_reason}` : ""}. Please upload a valid slip.
                </Alert>
              )}
              {slipUrl && (
                <p className="mt-3 text-sm text-muted">
                  Current slip:{" "}
                  <a href={slipUrl} target="_blank" rel="noreferrer" className="font-semibold text-brown-700 underline">
                    view
                  </a>
                </p>
              )}
              {canUpload && (
                <div className="mt-4">
                  <SlipUpload orderId={order.id} />
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
