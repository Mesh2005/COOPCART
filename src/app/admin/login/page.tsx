import Link from "next/link";
import type { Metadata } from "next";
import { Egg, Lock, ArrowLeft } from "lucide-react";
import { getCurrentProfile } from "@/lib/auth";
import { STAFF_ROLES } from "@/lib/types";
import { SignedInNotice } from "@/components/auth/signed-in-notice";
import { AdminLoginForm } from "./admin-login-form";

export const metadata: Metadata = {
  title: "Admin login",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const profile = await getCurrentProfile();
  const isStaff =
    profile && (STAFF_ROLES as readonly string[]).includes(profile.role);

  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-brown-900 px-5 py-12">
      {/* warm glow + grain on the dark admin backdrop */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(60%_60%_at_50%_0%,rgba(242,180,65,0.18),transparent_70%)]" />
      <div className="bg-grain pointer-events-none absolute inset-0 opacity-[0.07]" />

      <div className="relative w-full max-w-sm">
        <div className="mb-7 flex flex-col items-center text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-yolk-400 text-brown-900 shadow-lg">
            <Egg className="h-6 w-6" />
          </span>
          <h1 className="mt-4 font-display text-2xl font-semibold text-cream">
            CoopCart Admin
          </h1>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-brown-100/70">
            <Lock className="h-3.5 w-3.5" /> Staff &amp; management console
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-cream p-7 shadow-[0_30px_70px_-30px_rgba(0,0,0,0.6)] sm:p-8">
          {profile && (
            <SignedInNotice
              email={profile.email}
              role={profile.role}
              dashboardHref={isStaff ? "/admin" : "/app"}
              dashboardLabel={isStaff ? "Go to admin console" : "Go to your portal"}
              switchTo="/admin/login"
            />
          )}
          <AdminLoginForm next={next} />
        </div>

        <div className="mt-6 flex items-center justify-between text-sm">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-brown-100/70 transition-colors hover:text-cream"
          >
            <ArrowLeft className="h-4 w-4" /> Back to site
          </Link>
          <Link
            href="/login"
            className="text-brown-100/70 transition-colors hover:text-cream"
          >
            Customer login →
          </Link>
        </div>
      </div>
    </div>
  );
}
