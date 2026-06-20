import Link from "next/link";
import { Building2, ClipboardList, Egg, LayoutDashboard, ShoppingBasket, ShoppingCart, Wallet } from "lucide-react";
import { getMyBusiness, requireProfile } from "@/lib/auth";
import { NavLinks, type NavItem } from "@/components/dashboard/nav-links";
import { LogoutButton } from "@/components/dashboard/logout-button";
import { PageTransition } from "@/components/ui/page-transition";

const items: NavItem[] = [
  { href: "/app", label: "Dashboard", icon: LayoutDashboard },
  { href: "/app/catalog", label: "Catalogue", icon: ShoppingBasket },
  { href: "/app/cart", label: "Cart", icon: ShoppingCart },
  { href: "/app/orders", label: "Orders", icon: ClipboardList },
  { href: "/app/payments", label: "Payments", icon: Wallet },
  { href: "/app/profile", label: "Business profile", icon: Building2 },
];

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireProfile();
  const business = await getMyBusiness();

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="hidden border-r border-line bg-surface/60 lg:flex lg:flex-col">
        <Link href="/" className="flex items-center gap-2.5 px-5 py-5">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brown-600 text-cream">
            <Egg className="h-5 w-5" />
          </span>
          <span className="leading-none">
            <span className="block font-display text-lg font-semibold text-brown-900">CoopCart</span>
            <span className="block text-[11px] tracking-wide text-muted">Wholesale portal</span>
          </span>
        </Link>
        <div className="px-3">
          <NavLinks items={items} base="/app" />
        </div>
      </aside>

      <div className="flex min-h-dvh flex-col">
        <header className="flex items-center justify-between border-b border-line bg-surface/60 px-5 py-3 sm:px-8">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-brown-900">
              {business?.business_name ?? profile.full_name ?? "Your account"}
            </p>
            <p className="truncate text-xs text-muted">{profile.email}</p>
          </div>
          <LogoutButton />
        </header>

        <div className="border-b border-line bg-surface/40 px-3 py-2 lg:hidden">
          <NavLinks items={items} base="/app" className="flex-row overflow-x-auto" />
        </div>

        <main id="main-content" className="flex-1 px-5 py-6 sm:px-8 sm:py-8">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
    </div>
  );
}
