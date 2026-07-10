import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, FileText } from "lucide-react";
import { getOrderById, getSlipSignedUrl } from "@/lib/data/orders";
import { getActiveBankAccounts } from "@/lib/data/settings";
import { OrderTimeline } from "@/components/orders/order-timeline";
import { SlipUpload } from "@/components/orders/slip-upload";
import { Alert } from "@/components/ui/alert";
import { OrderStatusPill } from "@/components/ui/status-pill";
import { PAYMENT_STATUS_LABELS } from "@/lib/labels";
import { formatDate, formatLKR } from "@/lib/format";

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
  const data = await getOrderById(id);
  if (!data) notFound();

  const { order, items, payment } = data;
  const isBank = order.payment_method === "bank_transfer";
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

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="rounded-2xl border border-line bg-surface p-5">
          <h2 className="font-display text-lg font-semibold text-brown-900">Progress</h2>
          <div className="mt-4">
            <OrderTimeline status={order.status} fulfillment={order.fulfillment_type} />
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
