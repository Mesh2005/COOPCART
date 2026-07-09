import { cn } from "@/lib/utils";

/**
 * Soft, slowly-drifting colour blobs behind content. `variant="warm"` for
 * light cream surfaces, `variant="dark"` for the brown admin backdrop.
 */
export function AuroraBackground({
  className,
  variant = "warm",
}: {
  className?: string;
  variant?: "warm" | "dark";
}) {
  const blobs =
    variant === "dark"
      ? ["bg-yolk-400/25", "bg-[#d9833f]/25", "bg-sage-500/20"]
      : ["bg-yolk-300/45", "bg-sage-300/35", "bg-[#d9833f]/25"];

  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
    >
      <div
        className={cn(
          "animate-blob absolute -left-24 -top-24 h-80 w-80 rounded-full blur-3xl",
          blobs[0],
        )}
      />
      <div
        className={cn(
          "animate-blob absolute -right-16 top-24 h-96 w-96 rounded-full blur-3xl [animation-delay:-5s]",
          blobs[1],
        )}
      />
      <div
        className={cn(
          "animate-blob absolute bottom-0 left-1/3 h-80 w-80 rounded-full blur-3xl [animation-delay:-10s]",
          blobs[2],
        )}
      />
    </div>
  );
}
