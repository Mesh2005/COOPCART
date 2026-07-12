import { Users } from "lucide-react";
import { getCustomers } from "@/lib/data/admin/customers";
import { PageHeader } from "@/components/admin/page-header";
import { CustomerTable } from "@/components/admin/customer-table";
import { EmptyState } from "@/components/ui/empty-state";

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const validStatus = ["pending", "approved", "rejected", "suspended"].includes(
    status ?? "",
  )
    ? (status as "pending" | "approved" | "rejected" | "suspended")
    : undefined;

  const customers = await getCustomers(validStatus);
  const pending = customers.filter((c) => c.status === "pending").length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customers"
        description="Manage wholesale business accounts and approvals."
      />

      {pending > 0 && (
        <div className="rounded-2xl border border-yolk-300 bg-yolk-50 p-4 text-sm">
          <span className="font-semibold text-brown-900">{pending} business{pending !== 1 ? "es" : ""} pending approval.</span>{" "}
          <a href="?status=pending" className="font-medium text-brown-700 underline">
            View pending
          </a>
        </div>
      )}

      <div className="flex flex-wrap gap-2 text-sm">
        {[
          { label: "All", href: "/admin/customers" },
          { label: "Pending", href: "?status=pending" },
          { label: "Approved", href: "?status=approved" },
          { label: "Rejected", href: "?status=rejected" },
          { label: "Suspended", href: "?status=suspended" },
        ].map((f) => (
          <a
            key={f.label}
            href={f.href}
            className="rounded-full border border-line bg-surface px-3 py-1 font-medium text-brown-700 hover:bg-brown-50"
          >
            {f.label}
          </a>
        ))}
      </div>

      {customers.length === 0 ? (
        <EmptyState icon={Users} title="No customers found" description="New business registrations will appear here for approval." />
      ) : (
        <CustomerTable customers={customers} />
      )}
    </div>
  );
}
