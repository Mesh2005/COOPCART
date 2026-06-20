"use client";

import { useActionState } from "react";
import {
  approveBusinessAction,
  rejectBusinessAction,
  suspendBusinessAction,
} from "@/lib/actions/admin/customers";
import { initialActionState } from "@/lib/actions/state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BUSINESS_TYPE_LABELS } from "@/lib/labels";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { AdminCustomerRow } from "@/lib/data/admin/customers";
import type { AccountStatus } from "@/lib/types";

const STATUS_BADGE: Record<AccountStatus, "neutral" | "sage" | "accent" | "brand"> = {
  pending: "accent",
  approved: "sage",
  rejected: "neutral",
  suspended: "neutral",
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
    <div className="overflow-hidden rounded-2xl border border-line">
      <table className="w-full text-sm">
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
                <Badge variant={STATUS_BADGE[c.status]} className="capitalize">
                  {c.status}
                </Badge>
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
