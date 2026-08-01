import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import { getOrderById } from "@/lib/data/orders";
import { getMyBusiness } from "@/lib/auth";
import { getActiveBankAccounts } from "@/lib/data/settings";
import { BrandMark } from "@/components/brand/logo";
import { PrintButton } from "@/components/orders/print-button";
import { PAYMENT_STATUS_LABELS } from "@/lib/labels";
import { formatDate, formatLKR } from "@/lib/format";

export const metadata: Metadata = { title: "Invoice" };

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-4 py-0.5 text-sm">
      <dt className="text-muted">{k}</dt>
      <dd className="text-right font-medium text-brown-900">{v}</dd>
    </div>
  );
}

export default async function InvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getOrderById(id);
  if (!data) notFound();

  const { order, items } = data;
  const business = await getMyBusiness();
  const isBank = order.payment_method === "bank_transfer";
  const bank = isBank ? (await getActiveBankAccounts())[0] : null;

  return (
    <div className="mx-auto max-w-3xl">
      <div className="no-print mb-4 flex items-center justify-between">
        <Link
          href={`/app/orders/${order.id}`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-brown-800"
        >
          <ArrowLeft className="h-4 w-4" /> Back to order
        </Link>
        <PrintButton />
      </div>

      <div className="print-area rounded-2xl border border-line bg-surface p-8 sm:p-10">
        {/* header */}
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-line pb-6">
          <div className="flex items-center gap-3">
            <BrandMark className="h-10 w-auto" />
            <div>
              <p className="font-display text-xl font-semibold text-brown-900">CoopCart</p>
              <p className="text-xs text-muted">Abeyrathna Farms · Galahitiyawa, Sri Lanka</p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-display text-2xl font-semibold text-brown-900">Invoice</p>
            <p className="text-sm text-muted">{order.order_number}</p>
            <p className="text-xs text-muted">{formatDate(order.placed_at)}</p>
          </div>
        </div>

        {/* bill to + fulfilment */}
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">Billed to</p>
            <p className="mt-1 font-semibold text-brown-900">{business?.business_name ?? "—"}</p>
            <p className="text-sm text-muted">{business?.contact_person}</p>
            <p className="text-sm text-muted">{business?.phone}</p>
            <p className="text-sm text-muted">{business?.email}</p>
            {business?.address_line1 && (
              <p className="text-sm text-muted">
                {business.address_line1}
                {business.city ? `, ${business.city}` : ""}
              </p>
            )}
          </div>
          <div className="sm:text-right">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">Fulfilment</p>
            <p className="mt-1 text-sm text-brown-900">
              {order.fulfillment_type === "delivery" ? "Delivery" : "Pickup"}
              {order.scheduled_date ? ` · ${formatDate(order.scheduled_date)}` : ""}
            </p>
            {order.fulfillment_type === "delivery" && order.delivery_address && (
              <p className="text-sm text-muted">{order.delivery_address}</p>
            )}
            <p className="mt-2 text-sm text-brown-900">
              {isBank ? "Bank transfer" : "Cash on delivery"} ·{" "}
              {PAYMENT_STATUS_LABELS[order.payment_status]}
            </p>
          </div>
        </div>

        {/* items */}
        <table className="mt-6 w-full text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-muted">
              <th className="py-2">Item</th>
              <th className="py-2 text-center">Trays</th>
              <th className="py-2 text-right">Unit</th>
              <th className="py-2 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {items.map((it) => (
              <tr key={it.id}>
                <td className="py-2.5">
                  <p className="font-medium text-brown-900">{it.product_name_snapshot}</p>
                  {it.weight_range_snapshot && (
                    <p className="text-xs text-muted">{it.weight_range_snapshot}</p>
                  )}
                </td>
                <td className="py-2.5 text-center">{it.qty_trays}</td>
                <td className="py-2.5 text-right">{formatLKR(it.unit_price_snapshot)}</td>
                <td className="py-2.5 text-right font-medium">{formatLKR(it.line_total)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* totals */}
        <div className="mt-4 ml-auto max-w-xs border-t border-line pt-3">
          <Row k="Subtotal" v={formatLKR(order.subtotal)} />
          <Row k="Delivery fee" v={order.delivery_fee > 0 ? formatLKR(order.delivery_fee) : "Free"} />
          <div className="mt-1 flex justify-between border-t border-line pt-2 text-base font-semibold text-brown-900">
            <span>Total</span>
            <span>{formatLKR(order.total)}</span>
          </div>
        </div>

        {/* bank details for bank transfer */}
        {isBank && bank && order.payment_status !== "verified" && (
          <div className="mt-6 rounded-xl border border-line bg-brown-50/50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">
              Bank transfer details
            </p>
            <dl className="mt-2">
              <Row k="Account name" v={bank.account_name} />
              <Row k="Bank" v={bank.bank_name} />
              {bank.branch && <Row k="Branch" v={bank.branch} />}
              <Row k="Account number" v={bank.account_number} />
              <Row k="Reference" v={order.order_number} />
            </dl>
          </div>
        )}

        <p className="mt-8 border-t border-line pt-4 text-center text-xs text-muted">
          Thank you for your business. — Abeyrathna Farms
        </p>
      </div>
    </div>
  );
}
