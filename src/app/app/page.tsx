import Link from "next/link";
import { ArrowRight, CheckCircle2, Clock, ShieldAlert, ShoppingBasket } from "lucide-react";
import { getMyBusiness, requireProfile } from "@/lib/auth";
import { buttonVariants } from "@/components/ui/button";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { cn } from "@/lib/utils";

export default async function CustomerDashboard() {
  const profile = await requireProfile();
  const business = await getMyBusiness();
  const status = business?.status ?? "pending";
  const firstName = profile.full_name?.split(" ")[0];

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="animate-scale-in relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#6f4a2e] via-[#573a26] to-[#2a1d14] p-6 text-cream shadow-lg sm:p-8">
        <AuroraBackground variant="dark" className="opacity-70" />
        <div className="relative">
          <h1 className="font-display text-2xl font-semibold sm:text-3xl">
            Welcome{firstName ? `, ${firstName}` : ""}
          </h1>
          <p className="mt-1 text-sm text-cream/80">Here’s your wholesale account at a glance.</p>
        </div>
      </div>

      {status === "approved" ? (
        <>
          <div className="flex items-start gap-3 rounded-2xl border border-success/30 bg-success/10 p-5">
            <CheckCircle2 className="mt-0.5 h-5 w-5 text-success" />
            <div>
              <p className="font-semibold text-brown-900">Your account is approved</p>
              <p className="mt-1 text-sm text-muted">
                You have full access to wholesale pricing and ordering.
              </p>
            </div>
          </div>
          <div className="stagger grid gap-4 sm:grid-cols-2">
            <Link
              href="/app/catalog"
              className="card-hover group rounded-2xl border border-line bg-surface p-6"
            >
              <ShoppingBasket className="h-7 w-7 text-brown-500 transition-transform duration-300 group-hover:scale-110" />
              <p className="mt-4 font-semibold text-brown-900">Browse the catalogue</p>
              <p className="mt-1 text-sm text-muted">Order brown eggs by the tray with live bulk pricing.</p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brown-600">
                Start an order <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
            <Link
              href="/app/orders"
              className="card-hover group rounded-2xl border border-line bg-surface p-6"
            >
              <Clock className="h-7 w-7 text-brown-500 transition-transform duration-300 group-hover:scale-110" />
              <p className="mt-4 font-semibold text-brown-900">Track your orders</p>
              <p className="mt-1 text-sm text-muted">Follow each order from confirmation to delivery.</p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brown-600">
                View orders <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          </div>
        </>
      ) : status === "pending" ? (
        <div className="flex items-start gap-3 rounded-2xl border border-warning/30 bg-warning/10 p-5">
          <Clock className="mt-0.5 h-5 w-5 text-warning" />
          <div>
            <p className="font-semibold text-brown-900">Your account is under review</p>
            <p className="mt-1 text-sm text-muted">
              Thanks for registering{business ? ` ${business.business_name}` : ""}. Our team is verifying
              your business — you’ll be able to see wholesale pricing and place orders as soon as it’s approved.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex items-start gap-3 rounded-2xl border border-danger/30 bg-danger/10 p-5">
          <ShieldAlert className="mt-0.5 h-5 w-5 text-danger" />
          <div>
            <p className="font-semibold text-brown-900">
              Account {status === "rejected" ? "not approved" : "suspended"}
            </p>
            <p className="mt-1 text-sm text-muted">
              Please contact Abeyrathna Farms to resolve your account status.
            </p>
          </div>
        </div>
      )}

      {status === "approved" && (
        <Link href="/app/catalog" className={cn(buttonVariants(), "sm:hidden", "w-full")}>
          Browse catalogue
        </Link>
      )}
    </div>
  );
}
