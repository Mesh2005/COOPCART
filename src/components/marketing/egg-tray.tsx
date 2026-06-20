import { cn } from "@/lib/utils";

/**
 * Premium hand-drawn SVG of an open carton of fresh brown eggs.
 * The outer wrapper holds the 3D tilt; the inner wrapper gently floats so the
 * two transforms don't clash. Crisp at any size, fully themeable, no assets.
 */
export function EggTray({ className }: { className?: string }) {
  const cols = [128, 240, 352, 464];
  const rows = [150, 248, 346];
  const cells: { x: number; y: number; i: number }[] = [];
  let i = 0;
  for (const y of rows) for (const x of cols) cells.push({ x, y, i: i++ });
  // deterministic slight rotation so eggs look naturally placed (SSR-safe)
  const rot = (n: number) => ((n * 47) % 11) - 5;

  return (
    <div className={cn("relative", className)}>
      <div style={{ transform: "perspective(1200px) rotateX(10deg) rotateY(-8deg)" }}>
        <div className="animate-float">
          <svg
            viewBox="0 0 576 470"
            role="img"
            aria-label="A carton of fresh brown eggs, sold by the tray"
            className="h-auto w-full drop-shadow-[0_30px_45px_rgba(61,42,28,0.35)]"
          >
            <defs>
              <radialGradient id="ct-eggBody" cx="34%" cy="26%" r="80%">
                <stop offset="0%" stopColor="#eed2a8" />
                <stop offset="34%" stopColor="#cf9f67" />
                <stop offset="70%" stopColor="#9a6a3e" />
                <stop offset="100%" stopColor="#6b4a2e" />
              </radialGradient>
              <radialGradient id="ct-eggGloss" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#fffaf0" stopOpacity="0.95" />
                <stop offset="100%" stopColor="#fffaf0" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="ct-cartonTop" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f3e7d2" />
                <stop offset="100%" stopColor="#ddc6a2" />
              </linearGradient>
              <linearGradient id="ct-cartonSide" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#cdb188" />
                <stop offset="100%" stopColor="#ad8e66" />
              </linearGradient>
              <radialGradient id="ct-well" cx="50%" cy="40%" r="62%">
                <stop offset="0%" stopColor="#bf9f73" />
                <stop offset="100%" stopColor="#dcc4a0" />
              </radialGradient>
              <filter id="ct-soft" x="-60%" y="-60%" width="220%" height="220%">
                <feGaussianBlur stdDeviation="7" />
              </filter>

              <symbol id="ct-egg" viewBox="0 0 60 80">
                <path
                  d="M30 3 C 41 3 50 22 50 41 C 50 63 41 77 30 77 C 19 77 10 63 10 41 C 10 22 19 3 30 3 Z"
                  fill="url(#ct-eggBody)"
                />
                <ellipse
                  cx="22"
                  cy="23"
                  rx="8.5"
                  ry="12.5"
                  fill="url(#ct-eggGloss)"
                  transform="rotate(-20 22 23)"
                />
              </symbol>
            </defs>

            {/* soft contact shadow under the carton */}
            <ellipse cx="288" cy="432" rx="226" ry="34" fill="#3d2a1c" opacity="0.18" filter="url(#ct-soft)" />

            {/* carton thickness + top face */}
            <rect x="36" y="96" width="504" height="322" rx="42" fill="url(#ct-cartonSide)" />
            <rect x="32" y="64" width="512" height="336" rx="42" fill="url(#ct-cartonTop)" stroke="#c9a87e" strokeWidth="1.5" />
            <rect x="50" y="80" width="476" height="304" rx="34" fill="none" stroke="#d8bd96" strokeWidth="2" opacity="0.65" />

            {/* wells + eggs */}
            {cells.map(({ x, y, i: n }) => (
              <g key={n}>
                <ellipse cx={x} cy={y + 8} rx="52" ry="40" fill="url(#ct-well)" />
                <ellipse cx={x} cy={y + 28} rx="33" ry="11" fill="#3d2a1c" opacity="0.22" filter="url(#ct-soft)" />
                <use
                  href="#ct-egg"
                  x={x - 29}
                  y={y - 44}
                  width="58"
                  height="78"
                  transform={`rotate(${rot(n)} ${x} ${y})`}
                />
              </g>
            ))}
          </svg>
        </div>
      </div>
    </div>
  );
}
