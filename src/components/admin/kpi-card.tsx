import { TrendingUp, TrendingDown, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Sparkline } from "./sparkline";

export function KpiCard({
  label,
  value,
  sub,
  icon: Icon,
  trend,
  spark,
  accent = "text-brown-400",
}: {
  label: string;
  value: string;
  sub?: string;
  icon: LucideIcon;
  trend?: number;
  spark?: number[];
  accent?: string;
}) {
  const up = (trend ?? 0) >= 0;

  return (
    <div className="rounded-2xl border border-line bg-surface p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted">{label}</p>
        <Icon className={cn("h-4 w-4", accent)} />
      </div>
      <p className="mt-1.5 font-display text-2xl font-semibold text-brown-900">{value}</p>
      <div className="mt-2 flex items-end justify-between gap-3">
        <div className="flex items-center gap-2">
          {trend !== undefined && (
            <span
              className={cn(
                "inline-flex items-center gap-0.5 text-xs font-semibold",
                up ? "text-sage-600" : "text-red-600",
              )}
            >
              {up ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
              {Math.abs(trend).toFixed(0)}%
            </span>
          )}
          {sub && <span className="text-xs text-muted">{sub}</span>}
        </div>
        {spark && spark.length > 1 && (
          <div className={cn("w-24 flex-shrink-0", accent)}>
            <Sparkline data={spark} />
          </div>
        )}
      </div>
    </div>
  );
}
