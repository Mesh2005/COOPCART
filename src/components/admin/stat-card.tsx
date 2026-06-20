import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  accent?: "yolk" | "sage" | "brown" | "red";
}) {
  const iconClasses: Record<string, string> = {
    yolk: "bg-yolk-200 text-brown-800",
    sage: "bg-sage-100 text-sage-700",
    brown: "bg-brown-100 text-brown-700",
    red: "bg-red-100 text-red-700",
  };
  return (
    <div className="rounded-2xl border border-line bg-surface p-5">
      <div
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-xl",
          iconClasses[accent ?? "brown"],
        )}
      >
        <Icon className="h-5 w-5" />
      </div>
      <p className="mt-4 text-2xl font-semibold text-brown-900">{value}</p>
      <p className="mt-0.5 text-sm text-muted">{label}</p>
    </div>
  );
}
