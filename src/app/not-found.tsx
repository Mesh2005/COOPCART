import Link from "next/link";
import { Egg, Home, ArrowLeft } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-cream px-6 text-center">
      <div className="glow-warm pointer-events-none absolute inset-x-0 top-0 h-80" />
      <div className="bg-grain pointer-events-none absolute inset-0 opacity-60" />

      <div className="animate-scale-in relative">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-brown-600 text-cream shadow-lg">
          <Egg className="h-10 w-10" />
        </div>
      </div>

      <p className="animate-fade-up relative mt-8 font-display text-7xl font-semibold text-brown-900">
        404
      </p>
      <h1 className="animate-fade-up relative mt-2 text-2xl text-brown-800">
        This page cracked under pressure
      </h1>
      <p className="animate-fade-up relative mt-3 max-w-md text-pretty text-muted">
        We couldn’t find the page you were looking for. It may have moved, or
        perhaps it was never laid in the first place.
      </p>

      <div className="animate-fade-up relative mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link href="/" className={cn(buttonVariants())}>
          <Home className="h-4 w-4" /> Back home
        </Link>
        <Link
          href="/app"
          className={cn(buttonVariants({ variant: "secondary" }))}
        >
          <ArrowLeft className="h-4 w-4" /> Go to portal
        </Link>
      </div>
    </main>
  );
}
