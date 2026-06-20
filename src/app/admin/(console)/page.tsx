import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Boxes,
  ClipboardList,
  Egg,
  ShieldCheck,
  Truck,
  UserCog,
  Users,
  Wallet,
} from "lucide-react";
import { requireStaff } from "@/lib/auth";
import { getCustomers } from "@/lib/data/admin/customers";
import { getAllPayments } from "@/lib/data/admin/payments";

const modules = [
  { href: "/admin/orders", label: "Orders", desc: "Kanban board, status flow, fulfilment.", icon: ClipboardList },
  { href: "/admin/payments", label: "Payments", desc: "Verify bank slips, record COD.", icon: Wallet },
  { href: "/admin/products", label: "Products & pricing", desc: "Grades, prices, bulk tiers.", icon: Egg },
  { href: "/admin/inventory", label: "Inventory", desc: "Daily production, stock levels.", icon: Boxes },
  { href: "/admin/customers", label: "Customers", desc: "Approvals, accounts, history.", icon: Users },
  { href: "/admin/delivery", label: "Delivery", desc: "Zones, fees, days, assignments.", icon: Truck },
  { href: "/admin/reports", label: "Reports", desc: "Sales, payments, fulfilment.", icon: BarChart3 },
  { href: "/admin/staff", label: "Staff & roles", desc: "Manage team access.", icon: UserCog },
];

export default async function AdminOverview() {
  const profile = await requireStaff();
  const firstName = profile.full_name?.split(" ")[0];

  const [pendingCustomers, pendingSlips] = await Promise.all([
    getCustomers("pending"),
    getAllPayments("slip_uploaded"),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl text-brown-900">Admin overview</h1>
        <p className="mt-1 text-sm text-muted">
          Welcome{firstName ? `, ${firstName}` : ""}. Manage the CoopCart wholesale operation from here.
        </p>
      </div>

      {(pendingCustomers.length > 0 || pendingSlips.length > 0) && (
        <div className="grid gap-3 sm:grid-cols-2">
          {pendingCustomers.length > 0 && (
            <Link
              href="/admin/customers?status=pending"
              className="card-hover group flex items-center gap-4 rounded-2xl border border-yolk-300 bg-yolk-50 p-4"
            >
              <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-yolk-200 text-brown-800">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-brown-900">
                  {pendingCustomers.length} account
                  {pendingCustomers.length !== 1 ? "s" : ""} awaiting approval
                </p>
                <p className="text-sm text-muted">
                  Verify new wholesale businesses to unlock pricing &amp; ordering.
                </p>
              </div>
              <ArrowRight className="h-4 w-4 flex-shrink-0 text-brown-500 transition-transform group-hover:translate-x-0.5" />
            </Link>
          )}
          {pendingSlips.length > 0 && (
            <Link
              href="/admin/payments"
              className="card-hover group flex items-center gap-4 rounded-2xl border border-line bg-surface p-4"
            >
              <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-brown-100 text-brown-700">
                <Wallet className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-brown-900">
                  {pendingSlips.length} payment
                  {pendingSlips.length !== 1 ? "s" : ""} to verify
                </p>
                <p className="text-sm text-muted">Review uploaded bank transfer slips.</p>
              </div>
              <ArrowRight className="h-4 w-4 flex-shrink-0 text-brown-500 transition-transform group-hover:translate-x-0.5" />
            </Link>
          )}
        </div>
      )}

      <div className="stagger grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {modules.map((m) => (
          <Link
            key={m.href}
            href={m.href}
            className="card-hover group rounded-2xl border border-line bg-surface p-5"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brown-50 text-brown-500 transition-colors duration-300 group-hover:bg-yolk-200 group-hover:text-brown-700">
              <m.icon className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
            </div>
            <p className="mt-4 font-semibold text-brown-900">{m.label}</p>
            <p className="mt-1 text-sm text-muted">{m.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
