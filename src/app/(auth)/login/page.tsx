import Link from "next/link";
import type { Metadata } from "next";
import { getCurrentProfile } from "@/lib/auth";
import { STAFF_ROLES } from "@/lib/types";
import { SignedInNotice } from "@/components/auth/signed-in-notice";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Log in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; status?: string }>;
}) {
  const { next, status } = await searchParams;
  const profile = await getCurrentProfile();
  const isStaff =
    profile && (STAFF_ROLES as readonly string[]).includes(profile.role);

  return (
    <div>
      <h1 className="text-gradient-brand text-2xl font-semibold">Welcome back</h1>
      <p className="mt-1 text-sm text-muted">Log in to manage your wholesale orders.</p>
      <div className="mt-6">
        {profile && (
          <SignedInNotice
            email={profile.email}
            role={profile.role}
            dashboardHref={isStaff ? "/admin" : "/app"}
            dashboardLabel={isStaff ? "Go to admin console" : "Go to your portal"}
            switchTo="/login"
          />
        )}
        <LoginForm next={next} status={status} />
      </div>
      <p className="mt-6 text-center text-sm text-muted">
        New to CoopCart?{" "}
        <Link href="/register" className="font-semibold text-brown-700 hover:text-brown-900">
          Register your business
        </Link>
      </p>
    </div>
  );
}
