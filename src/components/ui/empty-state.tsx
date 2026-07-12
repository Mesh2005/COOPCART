import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "./button";

/** A friendly, consistent empty state with an icon, copy, and optional CTA. */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: { label: string; href: string };
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-3xl border border-dashed border-line bg-surface/60 px-6 py-14 text-center",
        className,
      )}
    >
      <div className="animate-float flex h-16 w-16 items-center justify-center rounded-2xl bg-brown-50 text-brown-400">
        <Icon className="h-8 w-8" />
      </div>
      <p className="mt-4 font-semibold text-brown-900">{title}</p>
      {description && <p className="mt-1.5 max-w-sm text-sm text-muted">{description}</p>}
      {action && (
        <Link href={action.href} className={cn(buttonVariants({ size: "sm" }), "mt-6")}>
          {action.label}
        </Link>
      )}
    </div>
  );
}
