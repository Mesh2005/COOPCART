import Link from "next/link";
import {
  BarChart3,
  Boxes,
  ClipboardList,
  Egg,
  LayoutDashboard,
  Settings,
  Truck,
  UserCog,
  Users,
  Wallet,
} from "lucide-react";
import { requireStaff } from "@/lib/auth";
import { NavLinks, type NavItem } from "@/components/dashboard/nav-links";
import { LogoutButton } from "@/components/dashboard/logout-button";

const items: NavItem[] = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Orders", icon: ClipboardList },
  { href: "/admin/payments", label: "Payments", icon: Wallet },
  { href: "/admin/products", label: "Products", icon: Egg },
  { href: "/admin/inventory", label: "Inventory", icon: Boxes },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/delivery", label: "Delivery", icon: Truck },
  { href: "/admin/reports", label: "Reports", icon: BarChart3 },
  { href: "/admin/staff", label: "Staff", icon: UserCog },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireStaff();

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="hidden border-r border-line bg-brown-900 text-cream lg:flex lg:flex-col">
        <Link href="/admin" className="flex items-center gap-2.5 px-5 py-5">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-yolk-400 text-brown-900">
            <Egg className="h-5 w-5" />
          </span>
          <span className="leading-none">
            <span className="block font-display text-lg font-semibold text-cream">CoopCart</span>
            <span className="block text-[11px] tracking-wide text-brown-100/70">Admin console</span>
          </span>
        </Link>
        <div className="px-3">
          <nav className="flex flex-col gap-1">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-brown-100/85 transition-colors hover:bg-white/10 hover:text-cream"
              >
                <item.icon className="h-[18px] w-[18px]" />
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </aside>

      <div className="flex min-h-dvh flex-col">
        <header className="flex items-center justify-between border-b border-line bg-surface/60 px-5 py-3 sm:px-8">
          <div>
            <p className="text-sm font-semibold text-brown-900">{profile.full_name ?? "Staff"}</p>
            <p className="text-xs capitalize text-muted">{profile.role}</p>
          </div>
          <LogoutButton />
        </header>

        <div className="border-b border-line bg-surface/40 px-3 py-2 lg:hidden">
          <NavLinks items={items} base="/admin" className="flex-row overflow-x-auto" />
        </div>

        <main className="flex-1 px-5 py-6 sm:px-8 sm:py-8">{children}</main>
      </div>
    </div>
  );
}
