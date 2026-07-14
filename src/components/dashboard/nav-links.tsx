"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Boxes,
  Building2,
  ClipboardList,
  LayoutDashboard,
  MessagesSquare,
  Settings,
  ShoppingBasket,
  ShoppingCart,
  Truck,
  UserCog,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { canAccessAdminPath } from "@/lib/rbac";
import type { UserRole } from "@/lib/types";
import { SupportBadge } from "@/components/admin/support-badge";

type NavItem = { href: string; label: string; icon: LucideIcon; badge?: "support" };

/**
 * Nav configuration lives inside this client component so the icon
 * components are bundled client-side. Passing Lucide icons from a Server
 * Component (the layout) as props would cross the server/client boundary
 * and throw "Only plain objects can be passed to Client Components".
 */
const NAVS: Record<"admin" | "app", { base: string; items: NavItem[] }> = {
  admin: {
    base: "/admin",
    items: [
      { href: "/admin", label: "Overview", icon: LayoutDashboard },
      { href: "/admin/orders", label: "Orders", icon: ClipboardList },
      { href: "/admin/payments", label: "Payments", icon: Wallet },
      { href: "/admin/products", label: "Products", icon: ShoppingBasket },
      { href: "/admin/inventory", label: "Inventory", icon: Boxes },
      { href: "/admin/customers", label: "Customers", icon: Users },
      { href: "/admin/chat", label: "Live support", icon: MessagesSquare, badge: "support" },
      { href: "/admin/delivery", label: "Delivery", icon: Truck },
      { href: "/admin/reports", label: "Reports", icon: BarChart3 },
      { href: "/admin/staff", label: "Staff", icon: UserCog },
      { href: "/admin/settings", label: "Settings", icon: Settings },
    ],
  },
  app: {
    base: "/app",
    items: [
      { href: "/app", label: "Dashboard", icon: LayoutDashboard },
      { href: "/app/catalog", label: "Catalogue", icon: ShoppingBasket },
      { href: "/app/cart", label: "Cart", icon: ShoppingCart },
      { href: "/app/orders", label: "Orders", icon: ClipboardList },
      { href: "/app/payments", label: "Payments", icon: Wallet },
      { href: "/app/profile", label: "Business profile", icon: Building2 },
    ],
  },
};

export function NavLinks({
  section,
  className,
  onNavigate,
  dark,
  role,
}: {
  section: "admin" | "app";
  className?: string;
  onNavigate?: () => void;
  dark?: boolean;
  /** Current user's role — used to hide admin links they can't access. */
  role?: UserRole;
}) {
  const pathname = usePathname();
  const { base, items: allItems } = NAVS[section];
  const items =
    section === "admin" && role
      ? allItems.filter((item) => canAccessAdminPath(role, item.href))
      : allItems;

  return (
    <nav className={cn("flex flex-col gap-1", className)}>
      {items.map((item) => {
        const active =
          item.href === base
            ? pathname === item.href
            : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
              dark
                ? active
                  ? "bg-white/15 text-cream"
                  : "text-cream/80 hover:bg-white/10 hover:text-cream"
                : active
                  ? "bg-[#6f4a2e] text-cream shadow-sm"
                  : "text-brown-700 hover:bg-brown-50",
            )}
          >
            <item.icon className="h-[18px] w-[18px] flex-shrink-0" />
            <span>{item.label}</span>
            {item.badge === "support" && <SupportBadge />}
          </Link>
        );
      })}
    </nav>
  );
}
