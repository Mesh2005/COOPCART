"use client";

import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 9999,
  disabled,
  className,
}: {
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
  className?: string;
}) {
  const clamp = (n: number) => Math.min(max, Math.max(min, n));
  return (
    <div className={cn("inline-flex items-center rounded-full border border-line bg-surface", className)}>
      <button
        type="button"
        disabled={disabled || value <= min}
        onClick={() => onChange(clamp(value - 1))}
        aria-label="Decrease quantity"
        className="flex h-9 w-9 items-center justify-center rounded-full text-brown-700 hover:bg-brown-50 disabled:opacity-40"
      >
        <Minus className="h-4 w-4" />
      </button>
      <input
        type="number"
        inputMode="numeric"
        value={value}
        min={min}
        max={max}
        disabled={disabled}
        onChange={(e) => {
          const n = parseInt(e.target.value, 10);
          onChange(Number.isNaN(n) ? min : clamp(n));
        }}
        className="w-12 border-0 bg-transparent text-center text-sm font-semibold text-brown-900 outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
      <button
        type="button"
        disabled={disabled || value >= max}
        onClick={() => onChange(clamp(value + 1))}
        aria-label="Increase quantity"
        className="flex h-9 w-9 items-center justify-center rounded-full text-brown-700 hover:bg-brown-50 disabled:opacity-40"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}
