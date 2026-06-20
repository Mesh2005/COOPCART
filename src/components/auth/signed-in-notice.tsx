import Link from "next/link";
import { signOutAction } from "@/lib/actions/auth";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

/**
 * Shown on a login page when a session already exists, so users understand
 * they're signed in and can either continue or sign out to switch accounts.
 */
export function SignedInNotice({
  email,
  role,
  dashboardHref,
  dashboardLabel,
  switchTo,
}: {
  email: string | null;
  role: string;
  dashboardHref: string;
  dashboardLabel: string;
  switchTo: string;
}) {
  return (
    <div className="mb-5 rounded-2xl border border-line bg-cream/70 p-4">
      <p className="text-sm text-brown-800">
        You’re signed in as{" "}
        <span className="font-semibold text-brown-900">{email ?? "your account"}</span>{" "}
        <span className="text-muted">({role})</span>.
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Link
          href={dashboardHref}
          className={cn(buttonVariants({ size: "sm" }))}
        >
          {dashboardLabel}
        </Link>
        <form action={signOutAction}>
          <input type="hidden" name="redirectTo" value={switchTo} />
          <button
            type="submit"
            className={cn(buttonVariants({ variant: "secondary", size: "sm" }))}
          >
            Sign out to switch
          </button>
        </form>
      </div>
      <p className="mt-2.5 text-xs text-muted">
        Or sign in below with a different account to switch.
      </p>
    </div>
  );
}
