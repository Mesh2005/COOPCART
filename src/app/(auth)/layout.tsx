import Link from "next/link";
import { Egg } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-dvh">
      <div className="glow-warm pointer-events-none absolute inset-x-0 top-0 h-64" />
      <div className="bg-grain pointer-events-none absolute inset-0 opacity-60" />
      <div className="relative mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-5 py-12">
        <Link
          href="/"
          className="animate-fade-up mb-8 flex items-center gap-2.5 self-center"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brown-600 text-cream transition-transform duration-300 hover:scale-105">
            <Egg className="h-5 w-5" />
          </span>
          <span className="leading-none">
            <span className="block font-display text-xl font-semibold text-brown-900">CoopCart</span>
            <span className="block text-[11px] tracking-wide text-muted">Abeyrathna Farms</span>
          </span>
        </Link>
        <div className="animate-scale-in rounded-3xl border border-line bg-surface p-7 shadow-[0_24px_60px_-35px_rgba(61,42,28,0.5)] sm:p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
