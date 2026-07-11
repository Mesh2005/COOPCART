"use client";

import { useActionState } from "react";
import {
  approveBusinessAction,
  rejectBusinessAction,
  suspendBusinessAction,
} from "@/lib/actions/admin/customers";
import { initialActionState } from "@/lib/actions/state";
import { Button } from "@/components/ui/button";
import { BUSINESS_TYPE_LABELS } from "@/lib/labels";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { AdminCustomerRow } from "@/lib/data/admin/customers";
import type { AccountStatus } from "@/lib/types";

const STATUS_STYLE: Record<AccountStatus, string> = {
  pending: "bg-amber-100 text-amber-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
  suspended: "bg-gray-200 text-gray-600",
};

function ActionButtons({ customer }: { customer: AdminCustomerRow }) {
  const [approveState, approveAction, approvePending] = useActionState(
    approveBusinessAction,
    initialActionState,
  );
  const [rejectState, rejectAction, rejectPending] = useActionState(
    rejectBusinessAction,
    initialActionState,
  );
  const [suspendState, suspendAction, suspendPending] = useActionState(
    suspendBusinessAction,
    initialActionState,
  );

  return (
    <div className="flex flex-wrap gap-2">
      {customer.status !== "approved" && (
        <form action={approveAction}>
          <input type="hidden" name="businessId" value={customer.id} />
          <Button size="sm" disabled={approvePending} variant="primary">
            {approvePending ? "…" : "Approve"}
          </Button>
        </form>
      )}
      {customer.status === "approved" && (
        <form action={suspendAction}>
          <input type="hidden" name="businessId" value={customer.id} />
          <Button size="sm" variant="outline" disabled={suspendPending}>
            {suspendPending ? "…" : "Suspend"}
          </Button>
        </form>
      )}
      {customer.status === "pending" && (
        <form action={rejectAction}>
          <input type="hidden" name="businessId" value={customer.id} />
          <Button size="sm" variant="destructive" disabled={rejectPending}>
            {rejectPending ? "…" : "Reject"}
          </Button>
        </form>
      )}
    </div>
  );
}

export function CustomerTable({
  customers,
}: {
  customers: AdminCustomerRow[];
}) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-line">
      <table className="w-full min-w-[820px] text-sm">
        <thead>
          <tr className="border-b border-line bg-brown-50 text-left text-xs font-semibold uppercase tracking-wide text-muted">
            <th className="px-4 py-3">Business</th>
            <th className="px-4 py-3">Type</th>
            <th className="px-4 py-3">Contact</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Orders</th>
            <th className="px-4 py-3">Registered</th>
            <th className="px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {customers.map((c) => (
            <tr key={c.id} className="hover:bg-brown-50/50 align-top">
              <td className="px-4 py-3">
                <p className="font-semibold text-brown-900">{c.business_name}</p>
                <p className="text-xs text-muted">{c.owner_email}</p>
              </td>
              <td className="px-4 py-3 text-muted">
                {BUSINESS_TYPE_LABELS[c.business_type]}
              </td>
              <td className="px-4 py-3 text-muted">
                <p>{c.contact_person}</p>
                <p className="text-xs">{c.phone}</p>
              </td>
              <td className="px-4 py-3">
                <span
                  className={cn(
                    "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold capitalize",
                    STATUS_STYLE[c.status],
                  )}
                >
                  {c.status}
                </span>
              </td>
              <td className="px-4 py-3 text-muted">{c.order_count}</td>
              <td className="px-4 py-3 text-muted text-xs">
                {formatDate(c.created_at)}
              </td>
              <td className="px-4 py-3">
                <ActionButtons customer={c} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
