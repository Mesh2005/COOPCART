"use client";

import { useActionState, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, ChevronsUpDown, Search } from "lucide-react";
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

type SortKey = "business" | "status" | "orders" | "created";

function StatusBadge({ status }: { status: AccountStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold capitalize",
        STATUS_STYLE[status],
      )}
    >
      {status}
    </span>
  );
}

function ActionButtons({ customer }: { customer: AdminCustomerRow }) {
  const [, approveAction, approvePending] = useActionState(approveBusinessAction, initialActionState);
  const [, rejectAction, rejectPending] = useActionState(rejectBusinessAction, initialActionState);
  const [, suspendAction, suspendPending] = useActionState(suspendBusinessAction, initialActionState);

  return (
    <div className="flex flex-wrap gap-2">
      {customer.status !== "approved" && (
        <form action={approveAction}>
          <input type="hidden" name="businessId" value={customer.id} />
          <Button size="sm" loading={approvePending} variant="primary">
            Approve
          </Button>
        </form>
      )}
      {customer.status === "approved" && (
        <form action={suspendAction}>
          <input type="hidden" name="businessId" value={customer.id} />
          <Button size="sm" variant="outline" loading={suspendPending}>
            Suspend
          </Button>
        </form>
      )}
      {customer.status === "pending" && (
        <form action={rejectAction}>
          <input type="hidden" name="businessId" value={customer.id} />
          <Button size="sm" variant="destructive" loading={rejectPending}>
            Reject
          </Button>
        </form>
      )}
    </div>
  );
}

export function CustomerTable({ customers }: { customers: AdminCustomerRow[] }) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" }>({
    key: "created",
    dir: "desc",
  });

  const rows = useMemo(() => {
    const term = query.trim().toLowerCase();
    const filtered = term
      ? customers.filter((c) =>
          [c.business_name, c.contact_person, c.owner_email, c.phone]
            .filter(Boolean)
            .some((v) => v!.toLowerCase().includes(term)),
        )
      : customers;

    const dir = sort.dir === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => {
      switch (sort.key) {
        case "business":
          return a.business_name.localeCompare(b.business_name) * dir;
        case "status":
          return a.status.localeCompare(b.status) * dir;
        case "orders":
          return (a.order_count - b.order_count) * dir;
        default:
          return (new Date(a.created_at).getTime() - new Date(b.created_at).getTime()) * dir;
      }
    });
  }, [customers, query, sort]);

  function toggleSort(key: SortKey) {
    setSort((s) => (s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" }));
  }

  function SortHeader({ label, k, className }: { label: string; k: SortKey; className?: string }) {
    const active = sort.key === k;
    return (
      <th className={cn("px-4 py-3", className)}>
        <button
          type="button"
          onClick={() => toggleSort(k)}
          className="inline-flex items-center gap-1 font-semibold uppercase tracking-wide hover:text-brown-700"
        >
          {label}
          {active ? (
            sort.dir === "asc" ? (
              <ArrowUp className="h-3 w-3" />
            ) : (
              <ArrowDown className="h-3 w-3" />
            )
          ) : (
            <ChevronsUpDown className="h-3 w-3 opacity-40" />
          )}
        </button>
      </th>
    );
  }

  return (
    <div className="space-y-3">
      <div className="relative max-w-xs">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search businesses…"
          className="h-10 w-full rounded-full border border-line bg-surface pl-9 pr-3 text-sm outline-none focus:border-brown-300"
        />
      </div>

      {rows.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-line bg-surface/60 px-4 py-10 text-center text-sm text-muted">
          No businesses match “{query}”.
        </p>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-x-auto rounded-2xl border border-line sm:block">
            <table className="w-full min-w-[820px] text-sm">
              <thead>
                <tr className="border-b border-line bg-brown-50 text-left text-xs font-semibold uppercase tracking-wide text-muted">
                  <SortHeader label="Business" k="business" />
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Contact</th>
                  <SortHeader label="Status" k="status" />
                  <SortHeader label="Orders" k="orders" />
                  <SortHeader label="Registered" k="created" />
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows.map((c) => (
                  <tr key={c.id} className="align-top hover:bg-brown-50/50">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-brown-900">{c.business_name}</p>
                      <p className="text-xs text-muted">{c.owner_email}</p>
                    </td>
                    <td className="px-4 py-3 text-muted">{BUSINESS_TYPE_LABELS[c.business_type]}</td>
                    <td className="px-4 py-3 text-muted">
                      <p>{c.contact_person}</p>
                      <p className="text-xs">{c.phone}</p>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="px-4 py-3 text-muted">{c.order_count}</td>
                    <td className="px-4 py-3 text-xs text-muted">{formatDate(c.created_at)}</td>
                    <td className="px-4 py-3">
                      <ActionButtons customer={c} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="space-y-3 sm:hidden">
            {rows.map((c) => (
              <div key={c.id} className="rounded-2xl border border-line bg-surface p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-brown-900">{c.business_name}</p>
                    <p className="truncate text-xs text-muted">{c.owner_email}</p>
                  </div>
                  <StatusBadge status={c.status} />
                </div>
                <dl className="mt-3 grid grid-cols-2 gap-y-1.5 text-xs">
                  <dt className="text-muted">Type</dt>
                  <dd className="text-right text-brown-800">{BUSINESS_TYPE_LABELS[c.business_type]}</dd>
                  <dt className="text-muted">Contact</dt>
                  <dd className="text-right text-brown-800">{c.contact_person}</dd>
                  <dt className="text-muted">Orders</dt>
                  <dd className="text-right text-brown-800">{c.order_count}</dd>
                  <dt className="text-muted">Registered</dt>
                  <dd className="text-right text-brown-800">{formatDate(c.created_at)}</dd>
                </dl>
                <div className="mt-3 border-t border-line pt-3">
                  <ActionButtons customer={c} />
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
