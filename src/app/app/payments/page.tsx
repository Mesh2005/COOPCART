import Link from "next/link";
import { Wallet, ArrowRight } from "lucide-react";
import { getMyOrders } from "@/lib/data/orders";
import { buttonVariants } from "@/components/ui/button";
import { PaymentStatusPill } from "@/components/ui/status-pill";
import { formatDate, formatLKR } from "@/lib/format";
import { cn } from "@/lib/utils";

export default async function PaymentsPage() {
  const orders = await getMyOrders();
  const payable = orders.filter((o) => o.status !== "cancelled");

  const outstanding = payable.filter(
    (o) => o.payment_status === "unpaid" || o.payment_status === "rejected",
  );

  if (payable.length === 0) {
    return (
      <div className="rounded-3xl border border-line bg-surface p-12 text-center">
        <Wallet className="mx-auto h-10 w-10 text-brown-300" />
        <p className="mt-4 font-semibold text-brown-900">No payments yet</p>
        <p className="mt-1 text-sm text-muted">
          Payments appear here once you place an order.
        </p>
        <Link href="/app/catalog" className={cn(buttonVariants(), "mt-6")}>
          Browse catalogue
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl text-brown-900">Payments</h1>
        <p className="mt-1 text-sm text-muted">
          Track the payment status of your orders and upload bank transfer slips.
        </p>
      </div>

      {outstanding.length > 0 && (
        <div className="flex items-start gap-3 rounded-2xl border border-warning/30 bg-warning/10 p-4">
          <Wallet className="mt-0.5 h-5 w-5 text-warning" />
          <p className="text-sm text-brown-800">
            You have <span className="font-semibold">{outstanding.length}</span>{" "}
            order{outstanding.length !== 1 ? "s" : ""} awaiting payment. Open an
            order to upload your bank transfer slip.
          </p>
        </div>
      )}

      <div className="stagger space-y-3">
        {payable.map((o) => (
          <Link
            key={o.id}
            href={`/app/orders/${o.id}`}
            className="card-hover flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-surface p-4"
          >
            <div className="min-w-0">
              <p className="font-semibold text-brown-900">{o.order_number}</p>
              <p className="text-xs text-muted">
                {formatDate(o.placed_at)} ·{" "}
                {o.payment_method === "bank_transfer" ? "Bank transfer" : "Cash on delivery"}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-semibold text-brown-900">{formatLKR(o.total)}</span>
              <PaymentStatusPill status={o.payment_status} />
              <ArrowRight className="h-4 w-4 text-brown-400" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
