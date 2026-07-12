import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Boxes,
  ClipboardList,
  Clock,
  Egg,
  PackageX,
  ShieldCheck,
  Truck,
  UserCog,
  Users,
  Wallet,
} from "lucide-react";
import { requireStaff } from "@/lib/auth";
import { getCustomers } from "@/lib/data/admin/customers";
import { getAllPayments } from "@/lib/data/admin/payments";
import { getInventory } from "@/lib/data/admin/inventory";
import { getReportData } from "@/lib/data/admin/reports";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { KpiCard } from "@/components/admin/kpi-card";
import { formatLKR } from "@/lib/format";
import { cn } from "@/lib/utils";

const modules = [
  { href: "/admin/orders", label: "Orders", desc: "Kanban board, status flow, fulfilment.", icon: ClipboardList, color: "bg-blue-100 text-blue-600" },
  { href: "/admin/payments", label: "Payments", desc: "Verify bank slips, record COD.", icon: Wallet, color: "bg-sage-200 text-sage-600" },
  { href: "/admin/products", label: "Products & pricing", desc: "Grades, prices, bulk tiers.", icon: Egg, color: "bg-yolk-200 text-yolk-500" },
  { href: "/admin/inventory", label: "Inventory", desc: "Daily production, stock levels.", icon: Boxes, color: "bg-purple-100 text-purple-600" },
  { href: "/admin/customers", label: "Customers", desc: "Approvals, accounts, history.", icon: Users, color: "bg-[#d9833f]/15 text-[#d9833f]" },
  { href: "/admin/delivery", label: "Delivery", desc: "Zones, fees, days, assignments.", icon: Truck, color: "bg-brown-100 text-brown-600" },
  { href: "/admin/reports", label: "Reports", desc: "Sales, payments, fulfilment.", icon: BarChart3, color: "bg-teal-100 text-teal-600" },
  { href: "/admin/staff", label: "Staff & roles", desc: "Manage team access.", icon: UserCog, color: "bg-rose-100 text-rose-600" },
];

export default async function AdminOverview() {
  const profile = await requireStaff();
  const firstName = profile.full_name?.split(" ")[0];

  const [pendingCustomers, pendingSlips, inventory, report] = await Promise.all([
    getCustomers("pending"),
    getAllPayments("slip_uploaded"),
    getInventory(),
    getReportData(14),
  ]);
  const lowStock = inventory.filter((i) => i.is_active && i.is_low);

  // Build a continuous 14-day series (fill gaps), split into this week / last week.
  const dayKey = (offset: number) =>
    new Date(Date.now() - offset * 86400_000).toISOString().split("T")[0];
  const byDate = new Map(report.daily.map((d) => [d.date, d]));
  const series = Array.from(
    { length: 14 },
    (_, i) => byDate.get(dayKey(13 - i)) ?? { date: dayKey(13 - i), revenue: 0, orders: 0 },
  );
  const last7 = series.slice(7);
  const prev7 = series.slice(0, 7);
  const sumBy = (arr: { revenue: number; orders: number }[], k: "revenue" | "orders") =>
    arr.reduce((s, d) => s + d[k], 0);
  const pct = (cur: number, prev: number) =>
    prev > 0 ? ((cur - prev) / prev) * 100 : cur > 0 ? 100 : 0;
  const revThis = sumBy(last7, "revenue");
  const ordThis = sumBy(last7, "orders");

  return (
    <div className="space-y-6">
      <div className="animate-scale-in relative overflow-hidden rounded-3xl bg-gradient-to-br from-brown-700 via-brown-800 to-brown-900 p-6 text-cream shadow-lg sm:p-8">
        <AuroraBackground variant="dark" className="opacity-70" />
        <div className="relative">
          <h1 className="font-display text-2xl font-semibold sm:text-3xl">Admin overview</h1>
          <p className="mt-1 text-sm text-cream/80">
            Welcome{firstName ? `, ${firstName}` : ""}. Manage the CoopCart wholesale operation from here.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Revenue · 7 days"
          value={formatLKR(revThis)}
          icon={Wallet}
          trend={pct(revThis, sumBy(prev7, "revenue"))}
          spark={last7.map((d) => d.revenue)}
          accent="text-sage-600"
        />
        <KpiCard
          label="Orders · 7 days"
          value={String(ordThis)}
          icon={ClipboardList}
          trend={pct(ordThis, sumBy(prev7, "orders"))}
          spark={last7.map((d) => d.orders)}
          accent="text-blue-500"
        />
        <KpiCard
          label="Avg order value"
          value={formatLKR(report.avgOrderValue)}
          sub="last 14 days"
          icon={Egg}
          accent="text-yolk-500"
        />
        <KpiCard
          label="Pending orders"
          value={String(report.pendingOrders)}
          sub={`${report.pendingPayments} slip${report.pendingPayments !== 1 ? "s" : ""} to verify`}
          icon={Clock}
          accent="text-[#d9833f]"
        />
      </div>

      {(pendingCustomers.length > 0 || pendingSlips.length > 0 || lowStock.length > 0) && (
        <div className="grid gap-3 sm:grid-cols-2">
          {lowStock.length > 0 && (
            <Link
              href="/admin/inventory"
              className="card-hover group flex items-center gap-4 rounded-2xl border border-red-200 bg-red-50 p-4"
            >
              <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">
                <PackageX className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-brown-900">
                  {lowStock.length} product{lowStock.length !== 1 ? "s" : ""} low on stock
                </p>
                <p className="text-sm text-muted">
                  {lowStock.map((p) => p.product_name.replace("Brown Eggs — ", "")).join(", ")} — add production.
                </p>
              </div>
              <ArrowRight className="h-4 w-4 flex-shrink-0 text-brown-500 transition-transform group-hover:translate-x-0.5" />
            </Link>
          )}
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
            <div className={cn("flex h-11 w-11 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110", m.color)}>
              <m.icon className="h-5 w-5" />
            </div>
            <p className="mt-4 font-semibold text-brown-900">{m.label}</p>
            <p className="mt-1 text-sm text-muted">{m.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
