"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type NavItem = { href: string; label: string; icon: LucideIcon };

export function NavLinks({
  items,
  base,
  className,
  onNavigate,
}: {
  items: NavItem[];
  base: string;
  className?: string;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  return (
    <nav className={cn("flex flex-col gap-1", className)}>
      {items.map((item) => {
        const active =
          item.href === base ? pathname === item.href : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
              active ? "bg-brown-600 text-cream shadow-sm" : "text-brown-700 hover:bg-brown-50",
            )}
          >
            <item.icon className="h-[18px] w-[18px]" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
