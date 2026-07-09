import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { AuroraBackground } from "@/components/ui/aurora-background";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-dvh bg-cream">
      <AuroraBackground variant="warm" />
      <div className="bg-grain pointer-events-none absolute inset-0 opacity-50" />
      <div className="relative mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-5 py-12">
        <Link
          href="/"
          className="animate-fade-up mb-8 flex items-center self-center text-brown-900 transition-transform duration-300 hover:scale-105"
        >
          <Logo />
        </Link>
        <div className="animate-scale-in overflow-hidden rounded-3xl border border-white/50 shadow-[0_30px_70px_-35px_rgba(61,42,28,0.55)]">
          <div className="bg-animated-gradient h-1.5 bg-gradient-to-r from-yolk-400 via-[#d9833f] to-sage-400" />
          <div className="glass p-7 sm:p-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
