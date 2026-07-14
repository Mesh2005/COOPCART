import Link from "next/link";
import type { Metadata } from "next";
import { Lock, ArrowLeft } from "lucide-react";
import { getCurrentProfile } from "@/lib/auth";
import { STAFF_ROLES } from "@/lib/types";
import { SignedInNotice } from "@/components/auth/signed-in-notice";
import { BrandMark } from "@/components/brand/logo";
import { AuroraBackground } from "@/components/ui/aurora-background";
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
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-[#2a1d14] px-5 py-12">
      <AuroraBackground variant="dark" />
      <div className="bg-grain pointer-events-none absolute inset-0 opacity-[0.07]" />

      <div className="animate-fade-up relative w-full max-w-sm">
        <div className="mb-7 flex flex-col items-center text-center">
          <span className="animate-scale-in flex h-12 w-12 items-center justify-center rounded-2xl bg-brown-50 shadow-lg ring-4 ring-white/10">
            <BrandMark className="h-7 w-7 text-[#d9833f]" />
          </span>
          <h1 className="mt-4 font-display text-2xl font-semibold text-cream">
            CoopCart <span className="text-yolk-400">Admin</span>
          </h1>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-cream/70">
            <Lock className="h-3.5 w-3.5" /> Staff &amp; management console
          </p>
        </div>

        <div className="overflow-hidden rounded-3xl border border-white/10 shadow-[0_30px_70px_-30px_rgba(0,0,0,0.6)]">
          <div className="bg-animated-gradient h-1.5 bg-gradient-to-r from-yolk-400 via-[#d9833f] to-sage-400" />
          <div className="bg-brown-50 p-7 sm:p-8">
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
        </div>

        <div className="mt-6 flex items-center justify-between text-sm">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-cream/70 transition-colors hover:text-cream"
          >
            <ArrowLeft className="h-4 w-4" /> Back to site
          </Link>
          <Link
            href="/login"
            className="text-cream/70 transition-colors hover:text-cream"
          >
            Customer login →
          </Link>
        </div>
      </div>
    </div>
  );
}
