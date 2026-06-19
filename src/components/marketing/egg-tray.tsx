import { cn } from "@/lib/utils";

/** Decorative 3D-ish tray of brown eggs (HTML/CSS, gently floating). */
export function EggTray({ className }: { className?: string }) {
  const eggs = Array.from({ length: 12 });
  return (
    <div className={cn("relative", className)}>
      <div
        className="rounded-[1.75rem] border border-brown-200/70 bg-gradient-to-b from-brown-100 to-brown-200/80 p-5 shadow-[0_30px_60px_-25px_rgba(61,42,28,0.55)]"
        style={{ transform: "perspective(1100px) rotateX(8deg) rotateY(-7deg)" }}
      >
        <div className="grid grid-cols-4 gap-3">
          {eggs.map((_, i) => (
            <div
              key={i}
              className="flex aspect-square items-center justify-center rounded-2xl bg-brown-300/25 shadow-inner"
            >
              <div
                className="animate-float h-9 w-7 sm:h-11 sm:w-9"
                style={{
                  animationDelay: `${(i % 4) * 0.25 + Math.floor(i / 4) * 0.15}s`,
                  borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%",
                  background:
                    "radial-gradient(120% 120% at 32% 26%, #d8b98c 0%, #b4824f 38%, #8b5e34 70%, #5a3b26 100%)",
                  boxShadow:
                    "inset 2px 3px 5px rgba(255,255,255,0.35), inset -2px -3px 6px rgba(0,0,0,0.28), 0 6px 10px -4px rgba(61,42,28,0.45)",
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
