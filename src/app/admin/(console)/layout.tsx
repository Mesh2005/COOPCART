import Link from "next/link";
import { requireStaff } from "@/lib/auth";
import { NavLinks } from "@/components/dashboard/nav-links";
import { LogoutButton } from "@/components/dashboard/logout-button";
import { PageTransition } from "@/components/ui/page-transition";
import { Logo } from "@/components/brand/logo";
import { NotificationBell } from "@/components/notifications/notification-bell";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireStaff();

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="hidden border-r border-line bg-brown-900 text-cream lg:flex lg:flex-col">
        <Link href="/admin" className="flex items-center px-5 py-5 text-cream">
          <Logo tagline="Admin console" />
        </Link>
        <div className="px-3">
          <NavLinks section="admin" dark />
        </div>
      </aside>

      <div className="flex min-h-dvh flex-col">
        <header className="flex items-center justify-between border-b border-line bg-surface/60 px-5 py-3 sm:px-8">
          <div>
            <p className="text-sm font-semibold text-brown-900">{profile.full_name ?? "Staff"}</p>
            <p className="text-xs capitalize text-muted">{profile.role}</p>
          </div>
          <div className="flex items-center gap-1">
            <NotificationBell />
            <LogoutButton redirectTo="/admin/login" />
          </div>
        </header>

        <div className="border-b border-line bg-surface/40 px-3 py-2 lg:hidden">
          <NavLinks section="admin" className="flex-row overflow-x-auto" />
        </div>

        <main id="main-content" className="flex-1 px-5 py-6 sm:px-8 sm:py-8">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
    </div>
  );
}
