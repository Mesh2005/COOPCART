import Link from "next/link";
import { Egg } from "lucide-react";
import { requireStaff } from "@/lib/auth";
import { NavLinks } from "@/components/dashboard/nav-links";
import { LogoutButton } from "@/components/dashboard/logout-button";
import { PageTransition } from "@/components/ui/page-transition";

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
          <NavLinks section="admin" dark />
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
          <NavLinks section="admin" className="flex-row overflow-x-auto" />
        </div>

        <main id="main-content" className="flex-1 px-5 py-6 sm:px-8 sm:py-8">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
    </div>
  );
}
