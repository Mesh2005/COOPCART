import { Wallet } from "lucide-react";
import { getAllPayments, getPaymentSlipUrl } from "@/lib/data/admin/payments";
import { VerifyPaymentForm } from "@/components/admin/verify-payment-form";
import { PageHeader } from "@/components/admin/page-header";
import { Badge } from "@/components/ui/badge";
import { PAYMENT_STATUS_LABELS } from "@/lib/labels";
import { formatDate, formatLKR } from "@/lib/format";
import Link from "next/link";

export default async function AdminPaymentsPage() {
  const [pending, all] = await Promise.all([
    getAllPayments("slip_uploaded"),
    getAllPayments(undefined, 50),
  ]);

  const pendingWithUrls = await Promise.all(
    pending.map(async (p) => ({
      ...p,
      signedUrl: p.slip_url ? await getPaymentSlipUrl(p.slip_url) : null,
    })),
  );

  const recent = all.filter((p) => p.status !== "slip_uploaded").slice(0, 20);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Payments"
        description="Verify bank transfer slips and track payment status."
      />

      <section>
        <h2 className="mb-4 font-display text-lg font-semibold text-brown-900">
          Pending verification
          {pending.length > 0 && (
            <span className="ml-2 rounded-full bg-yolk-400 px-2 py-0.5 text-sm font-semibold text-brown-900">
              {pending.length}
            </span>
          )}
        </h2>
        {pendingWithUrls.length === 0 ? (
          <div className="rounded-2xl border border-line bg-surface p-8 text-center text-muted">
            <Wallet className="mx-auto h-10 w-10 text-brown-200" />
            <p className="mt-3">No slips waiting for verification.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {pendingWithUrls.map((p) => (
              <VerifyPaymentForm
                key={p.payment_id}
                paymentId={p.payment_id}
                orderNumber={p.order_number}
                businessName={p.business_name}
                amount={p.amount}
                slipUrl={p.signedUrl}
                uploadedAt={p.uploaded_at}
                rejectReason={p.reject_reason}
              />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-4 font-display text-lg font-semibold text-brown-900">
          Recent payments
        </h2>
        <div className="overflow-x-auto rounded-2xl border border-line">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-line bg-brown-50 text-left text-xs font-semibold uppercase tracking-wide text-muted">
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Business</th>
                <th className="px-4 py-3">Method</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {recent.map((p) => (
                <tr key={p.payment_id} className="hover:bg-brown-50/50">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/orders/${p.order_id}`}
                      className="font-medium text-brown-700 hover:underline"
                    >
                      {p.order_number}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-muted">{p.business_name}</td>
                  <td className="px-4 py-3 capitalize text-muted">
                    {p.method === "bank_transfer" ? "Bank transfer" : "COD"}
                  </td>
                  <td className="px-4 py-3 font-medium text-brown-800">
                    {formatLKR(p.amount)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={
                        p.status === "verified" || p.status === "paid_cod"
                          ? "sage"
                          : p.status === "rejected"
                            ? "neutral"
                            : "accent"
                      }
                    >
                      {PAYMENT_STATUS_LABELS[p.status]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {formatDate(p.placed_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
