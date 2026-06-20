"use client";

import { useRef } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
} from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * 3D-style studio render of brown eggs (pure SVG) that tilts toward the
 * cursor with a smooth spring and eases back on leave. Specular highlights,
 * warm reflected bounce light, soft cast shadows and a glossy floor
 * reflection. Gently floats; no external assets.
 */
export function EggTray({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  // Pointer position relative to the card centre, normalised to -0.5..0.5.
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const sx = useSpring(px, { stiffness: 140, damping: 16, mass: 0.4 });
  const sy = useSpring(py, { stiffness: 140, damping: 16, mass: 0.4 });

  const rotateY = useTransform(sx, [-0.5, 0.5], [-16, 16]);
  const rotateX = useTransform(sy, [-0.5, 0.5], [12, -12]);

  function handleMove(e: React.MouseEvent<HTMLDivElement>) {
    if (reduce) return;
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    px.set((e.clientX - rect.left) / rect.width - 0.5);
    py.set((e.clientY - rect.top) / rect.height - 0.5);
  }
  function handleLeave() {
    px.set(0);
    py.set(0);
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className={cn("relative [perspective:1100px]", className)}
    >
      <motion.div
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        whileHover={reduce ? undefined : { scale: 1.03 }}
        transition={{ type: "spring", stiffness: 200, damping: 18 }}
        className="will-change-transform"
      >
        <div className="animate-float">
          <svg
            viewBox="0 0 600 500"
            role="img"
            aria-label="Three glossy brown eggs under studio light, sold by the tray"
            className="h-auto w-full"
          >
            <defs>
              <radialGradient id="ht-glow" cx="50%" cy="38%" r="60%">
                <stop offset="0%" stopColor="#fbeccb" stopOpacity="0.85" />
                <stop offset="55%" stopColor="#f6e2c0" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#f6e2c0" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="ht-body" cx="36%" cy="24%" r="82%">
                <stop offset="0%" stopColor="#fcecce" />
                <stop offset="20%" stopColor="#eec78c" />
                <stop offset="46%" stopColor="#d09c5e" />
                <stop offset="72%" stopColor="#9c6c3f" />
                <stop offset="90%" stopColor="#5f4027" />
                <stop offset="100%" stopColor="#7a5230" />
              </radialGradient>
              <radialGradient id="ht-refl" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#f0c389" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#f0c389" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="ht-gloss" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#fffdf6" stopOpacity="0.98" />
                <stop offset="100%" stopColor="#fffdf6" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="ht-floorrefl" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#9c6c3f" stopOpacity="0.28" />
                <stop offset="100%" stopColor="#9c6c3f" stopOpacity="0" />
              </linearGradient>
              <filter id="ht-soft" x="-60%" y="-60%" width="220%" height="220%">
                <feGaussianBlur stdDeviation="9" />
              </filter>
              <filter id="ht-soft2" x="-60%" y="-60%" width="220%" height="220%">
                <feGaussianBlur stdDeviation="4" />
              </filter>
              <symbol id="ht-egg" viewBox="0 0 120 160">
                <clipPath id="ht-clip">
                  <path d="M60 6 C 86 6 104 50 104 86 C 104 128 86 154 60 154 C 34 154 16 128 16 86 C 16 50 34 6 60 6 Z" />
                </clipPath>
                <path
                  d="M60 6 C 86 6 104 50 104 86 C 104 128 86 154 60 154 C 34 154 16 128 16 86 C 16 50 34 6 60 6 Z"
                  fill="url(#ht-body)"
                />
                <g clipPath="url(#ht-clip)">
                  <ellipse cx="84" cy="126" rx="46" ry="40" fill="url(#ht-refl)" opacity="0.6" />
                  <ellipse cx="42" cy="118" rx="34" ry="46" fill="#3a2616" opacity="0.18" filter="url(#ht-soft2)" />
                </g>
                <ellipse cx="44" cy="46" rx="11" ry="17" fill="url(#ht-gloss)" transform="rotate(-22 44 46)" />
                <ellipse cx="63" cy="34" rx="4" ry="6" fill="#fffdf6" opacity="0.85" transform="rotate(-22 63 34)" />
              </symbol>
            </defs>

            <ellipse cx="300" cy="210" rx="300" ry="230" fill="url(#ht-glow)" />

            <ellipse cx="215" cy="360" rx="78" ry="20" fill="#3a2616" opacity="0.20" filter="url(#ht-soft)" />
            <ellipse cx="392" cy="356" rx="80" ry="20" fill="#3a2616" opacity="0.20" filter="url(#ht-soft)" />
            <ellipse cx="300" cy="392" rx="110" ry="27" fill="#3a2616" opacity="0.26" filter="url(#ht-soft)" />
            <path d="M150 370 H450 L470 470 H130 Z" fill="url(#ht-floorrefl)" opacity="0.5" />

            <use href="#ht-egg" x="150" y="110" width="150" height="200" transform="rotate(-13 225 210)" />
            <use href="#ht-egg" x="300" y="96" width="156" height="208" transform="rotate(12 378 200)" />
            <use href="#ht-egg" x="208" y="128" width="184" height="245" transform="rotate(-4 300 250)" />
          </svg>
        </div>
      </motion.div>
    </div>
  );
}
