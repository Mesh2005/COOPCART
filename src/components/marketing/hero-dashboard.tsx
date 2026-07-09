"use client";

import { useRef } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
} from "framer-motion";
import { CountUp } from "@/components/ui/count-up";
import { BrandMark } from "@/components/brand/logo";
import { cn } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;
const bars = [46, 62, 54, 78, 60, 96, 71];
const days = ["M", "T", "W", "T", "F", "S", "S"];
const orders = [
  { id: "CC-2026-00042", biz: "Sunrise Bakery", label: "Delivered", cls: "bg-green-100 text-green-700" },
  { id: "CC-2026-00041", biz: "Lanka Grand Hotel", label: "Confirmed", cls: "bg-blue-100 text-blue-700" },
  { id: "CC-2026-00040", biz: "City Grocers", label: "Pending", cls: "bg-amber-100 text-amber-700" },
];

/**
 * Animated "order dashboard" hero visual — count-up revenue, growing bar
 * chart, live status pills, and a rooster mark. Tilts toward the cursor.
 */
export function HeroDashboard({ className }: { className?: string }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const sx = useSpring(px, { stiffness: 140, damping: 16, mass: 0.4 });
  const sy = useSpring(py, { stiffness: 140, damping: 16, mass: 0.4 });
  const rotateY = useTransform(sx, [-0.5, 0.5], [-9, 9]);
  const rotateX = useTransform(sy, [-0.5, 0.5], [7, -7]);

  function move(e: React.MouseEvent<HTMLDivElement>) {
    if (reduce) return;
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    px.set((e.clientX - r.left) / r.width - 0.5);
    py.set((e.clientY - r.top) / r.height - 0.5);
  }
  function leave() {
    px.set(0);
    py.set(0);
  }

  return (
    <div
      ref={ref}
      onMouseMove={move}
      onMouseLeave={leave}
      className={cn("relative [perspective:1200px]", className)}
    >
      <motion.div
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="will-change-transform"
      >
        <div className="rounded-3xl border border-line bg-surface/95 p-5 shadow-[0_30px_60px_-25px_rgba(61,42,28,0.45)] backdrop-blur">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BrandMark className="h-6 w-auto" />
              <span className="text-sm font-semibold text-brown-900">Orders</span>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-2.5 py-1 text-[11px] font-semibold text-green-700">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-green-500" />
              </span>
              Live
            </span>
          </div>

          <div className="mt-4 flex items-end justify-between">
            <div>
              <p className="text-xs text-muted">Revenue today</p>
              <p className="font-display text-3xl font-semibold text-brown-900">
                <CountUp value={48200} prefix="Rs " />
              </p>
            </div>
            <span className="rounded-full bg-sage-300/35 px-2 py-1 text-[11px] font-semibold text-sage-600">
              ▲ 12%
            </span>
          </div>
          <div className="mt-1.5 flex gap-4 text-xs text-muted">
            <span>
              <CountUp value={24} className="font-semibold text-brown-800" /> orders
            </span>
            <span>
              <CountUp value={312} className="font-semibold text-brown-800" /> trays
            </span>
          </div>

          <div className="mt-4 flex items-end justify-between gap-2">
            {bars.map((h, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
                <div className="flex w-full items-end" style={{ height: 52 }}>
                  <motion.div
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ delay: 0.25 + i * 0.07, duration: 0.6, ease: EASE }}
                    style={{ height: `${h}%`, transformOrigin: "bottom" }}
                    className={cn("w-full rounded-md", i === 5 ? "bg-brown-600" : "bg-yolk-300")}
                  />
                </div>
                <span className="text-[10px] text-muted">{days[i]}</span>
              </div>
            ))}
          </div>

          <div className="mt-4 space-y-2 border-t border-line pt-3">
            {orders.map((o, i) => (
              <motion.div
                key={o.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.65 + i * 0.15, duration: 0.4, ease: EASE }}
                className="flex items-center justify-between gap-2"
              >
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-brown-900">{o.id}</p>
                  <p className="truncate text-[11px] text-muted">{o.biz}</p>
                </div>
                <span className={cn("flex-shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold", o.cls)}>
                  {o.label}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.85, duration: 0.5, ease: EASE }}
        className="absolute -left-4 top-10 rounded-2xl border border-line bg-surface/90 px-3.5 py-2 shadow-lg backdrop-blur"
      >
        <p className="text-[11px] font-medium text-muted">New order</p>
        <p className="text-sm font-semibold text-brown-900">+3 today</p>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.5, ease: EASE }}
        className="absolute -bottom-4 right-2 rounded-2xl border border-line bg-surface/90 px-3.5 py-2 shadow-lg backdrop-blur"
      >
        <p className="text-[11px] font-medium text-muted">Fulfilment</p>
        <p className="text-sm font-semibold text-brown-900">On schedule</p>
      </motion.div>
    </div>
  );
}
