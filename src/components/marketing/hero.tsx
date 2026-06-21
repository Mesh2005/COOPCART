"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, BadgeCheck, Egg, Truck, Wallet } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { SplineScene } from "@/components/ui/splite";
import { cn } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number];

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: EASE },
});

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="glow-warm pointer-events-none absolute inset-x-0 top-0 h-[520px]" />
      <div className="bg-grain pointer-events-none absolute inset-0 opacity-70" />

      <div className="relative mx-auto grid min-h-dvh w-full max-w-7xl items-center gap-6 px-5 sm:px-8 lg:grid-cols-2">
        <div className="py-14 lg:py-0">
          <motion.div
            {...fadeUp(0)}
            className="inline-flex items-center gap-2 rounded-full border border-brown-200 bg-surface/70 px-3 py-1 text-xs font-medium text-brown-700 backdrop-blur"
          >
            <Egg className="h-3.5 w-3.5 text-yolk-500" /> Wholesale eggs · Abeyrathna Farms
          </motion.div>

          <motion.h1
            {...fadeUp(0.05)}
            className="mt-5 text-balance text-4xl leading-[1.05] text-brown-900 sm:text-5xl lg:text-6xl"
          >
            Farm-fresh eggs, <span className="text-brown-500">wholesale</span> — ordered in minutes.
          </motion.h1>

          <motion.p
            {...fadeUp(0.12)}
            className="mt-5 max-w-xl text-pretty text-lg text-muted"
          >
            CoopCart brings Abeyrathna Farms’ egg supply online. Graded by size,
            priced by the tray, and delivered on a schedule your shop, bakery, or
            kitchen can count on.
          </motion.p>

          <motion.div {...fadeUp(0.18)} className="mt-8 flex flex-wrap items-center gap-3">
            <Link href="/register" className={cn(buttonVariants({ size: "lg" }))}>
              Register your business <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/products"
              className={cn(buttonVariants({ variant: "secondary", size: "lg" }))}
            >
              Browse the catalogue
            </Link>
          </motion.div>

          <motion.ul
            {...fadeUp(0.24)}
            className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-sm font-medium text-brown-700"
          >
            <li className="flex items-center gap-2">
              <BadgeCheck className="h-4 w-4 text-sage-500" /> 3 graded sizes
            </li>
            <li className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-sage-500" /> 4 delivery days a week
            </li>
            <li className="flex items-center gap-2">
              <Wallet className="h-4 w-4 text-sage-500" /> Bank transfer or COD
            </li>
          </motion.ul>
        </div>

        {/* interactive 3D scene */}
        <div className="relative h-[340px] w-full sm:h-[420px] lg:h-dvh">
          <SplineScene
            scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
            className="h-full w-full"
          />
        </div>
      </div>
    </section>
  );
}
