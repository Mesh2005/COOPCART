import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "flex h-11 w-full rounded-xl border border-line bg-surface px-3.5 text-sm text-ink shadow-sm transition-colors",
        "placeholder:text-muted/70 focus-visible:border-brown-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brown-400/40",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";
