import Link from "next/link";
import {
  BarChart3,
  Boxes,
  ClipboardList,
  Egg,
  Truck,
  UserCog,
  Users,
  Wallet,
} from "lucide-react";
import { requireStaff } from "@/lib/auth";

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl text-brown-900">Admin overview</h1>
        <p className="mt-1 text-sm text-muted">
          Welcome{firstName ? `, ${firstName}` : ""}. Manage the CoopCart wholesale operation from here.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {modules.map((m) => (
          <Link
            key={m.href}
            href={m.href}
            className="group rounded-2xl border border-line bg-surface p-5 transition-all hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brown-50 text-brown-500 transition-colors group-hover:bg-yolk-200 group-hover:text-brown-700">
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
