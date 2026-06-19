import * as React from "react";
import { AlertCircle, CheckCircle2, Info } from "lucide-react";
import { cn } from "@/lib/utils";

const styles = {
  info: "border-info/30 bg-info/10 text-info",
  error: "border-danger/30 bg-danger/10 text-danger",
  success: "border-success/30 bg-success/10 text-success",
} as const;

const icons = { info: Info, error: AlertCircle, success: CheckCircle2 } as const;

export function Alert({
  variant = "info",
  className,
  children,
}: {
  variant?: keyof typeof styles;
  className?: string;
  children: React.ReactNode;
}) {
  const Icon = icons[variant];
  return (
    <div className={cn("flex items-start gap-2.5 rounded-xl border px-3.5 py-2.5 text-sm", styles[variant], className)}>
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <div>{children}</div>
    </div>
  );
}
