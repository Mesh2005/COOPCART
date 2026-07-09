"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

/** SVG rooster (fallback shown only if /logo-mark.png fails to load). */
function BrandMarkSvg({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} role="img" aria-label="CoopCart" fill="none">
      <g fill="currentColor">
        <path d="M15 31 C6 28 6 14 12 10 C12.5 18 17 21 21 22.5 C18 25.5 16.5 28 16.5 32 Z" />
        <path d="M14.5 30.5 C14.5 22.5 20.5 18 27.5 19.2 C33.5 20.2 36.5 25 34.5 31 C33 36 27.5 39 21.5 38 C16.8 37.2 14.5 34.2 14.5 30.5 Z" />
        <path d="M30 22 C30.5 15.5 34.5 12 38.8 13 C43 14 44 19 40.8 22 C38.5 24 35 24 33 26 C32 24.3 31 23 30 22 Z" />
        <path d="M35.5 9.5 C36.5 6.5 38.5 7.2 38.8 9.5 C40.5 6.8 42.8 8.3 42 10.5 C40.5 11 37 11 35.5 11 Z" />
        <path d="M43 17.5 L48 18.5 L43 20.5 Z" />
        <path d="M40 21.5 C42 23.5 42 26.5 40 27.5 C38 25.5 38 22.5 40 21.5 Z" />
      </g>
      <path
        d="M23 37.5 L22 44 M18.5 44 L26 44 M28 37.5 L28 44 M24.5 44 L32 44"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * The official CoopCart rooster mark (public/logo-mark.png), with the SVG
 * rooster as a graceful fallback.
 */
export function BrandMark({ className }: { className?: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) return <BrandMarkSvg className={cn("h-8 w-8 text-[#d9833f]", className)} />;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/logo-mark.png"
      alt="CoopCart"
      onError={() => setFailed(true)}
      className={cn("h-8 w-auto object-contain", className)}
    />
  );
}

/** Full lockup: rooster mark + "CoopCart" wordmark (+ optional tagline). */
export function Logo({
  className,
  markClassName,
  tagline = "Abeyrathna Farms",
  compact = false,
}: {
  className?: string;
  markClassName?: string;
  tagline?: string | null;
  compact?: boolean;
}) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <BrandMark className={cn(compact ? "h-7" : "h-9", markClassName)} />
      <span className="leading-none">
        <span
          className={cn(
            "block font-display font-semibold tracking-tight",
            compact ? "text-base" : "text-lg",
          )}
        >
          CoopCart
        </span>
        {tagline && (
          <span className="block text-[11px] tracking-wide opacity-70">{tagline}</span>
        )}
      </span>
    </span>
  );
}
