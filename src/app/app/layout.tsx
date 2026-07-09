import Link from "next/link";
import { redirect } from "next/navigation";
import { getMyBusiness, requireProfile } from "@/lib/auth";
import { STAFF_ROLES } from "@/lib/types";
import { NavLinks } from "@/components/dashboard/nav-links";
import { LogoutButton } from "@/components/dashboard/logout-button";
import { PageTransition } from "@/components/ui/page-transition";
import { Logo } from "@/components/brand/logo";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireProfile();
  // Staff belong in the admin console, not the customer portal.
  if ((STAFF_ROLES as readonly string[]).includes(profile.role)) redirect("/admin");
  const business = await getMyBusiness();

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="hidden border-r border-line bg-surface/60 lg:flex lg:flex-col">
        <Link href="/" className="flex items-center px-5 py-5 text-brown-900">
          <Logo tagline="Wholesale portal" />
        </Link>
        <div className="px-3">
          <NavLinks section="app" />
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
          <NavLinks section="app" className="flex-row overflow-x-auto" />
        </div>

        <main id="main-content" className="flex-1 px-5 py-6 sm:px-8 sm:py-8">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
    </div>
  );
}
