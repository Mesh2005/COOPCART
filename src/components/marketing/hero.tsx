"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, BadgeCheck, Egg, Truck, Wallet } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Spotlight } from "@/components/ui/spotlight";
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
    <section className="p-4 sm:p-6">
      <Card className="relative mx-auto h-[calc(100dvh-2rem)] min-h-[34rem] w-full max-w-7xl overflow-hidden rounded-3xl border-brown-800 bg-brown-900 sm:h-[calc(100dvh-3rem)]">
        {/* warm spotlight sweep */}
        <Spotlight className="-top-40 left-0 md:-top-20 md:left-60" fill="#f2b441" />
        <div className="bg-grain pointer-events-none absolute inset-0 opacity-[0.08]" />

        <div className="flex h-full flex-col md:flex-row">
          {/* Left content */}
          <div className="relative z-10 flex flex-1 flex-col justify-center p-8 sm:p-12">
            <motion.div
              {...fadeUp(0)}
              className="inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-brown-100 backdrop-blur"
            >
              <Egg className="h-3.5 w-3.5 text-yolk-400" /> Wholesale eggs · Abeyrathna Farms
            </motion.div>

            <motion.h1
              {...fadeUp(0.05)}
              className="mt-5 bg-gradient-to-b from-cream to-brown-300 bg-clip-text font-display text-4xl font-semibold leading-[1.05] tracking-tight text-transparent text-balance sm:text-5xl lg:text-6xl"
            >
              Farm-fresh eggs, wholesale — ordered in minutes.
            </motion.h1>

            <motion.p
              {...fadeUp(0.12)}
              className="mt-5 max-w-lg text-pretty text-base text-brown-100/75 sm:text-lg"
            >
              CoopCart brings Abeyrathna Farms’ egg supply online. Graded by size,
              priced by the tray, and delivered on a schedule your shop, bakery, or
              kitchen can count on.
            </motion.p>

            <motion.div {...fadeUp(0.18)} className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/register" className={cn(buttonVariants({ variant: "accent", size: "lg" }))}>
                Register your business <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/products"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "border-white/25 bg-transparent text-cream hover:bg-white/10",
                )}
              >
                Browse the catalogue
              </Link>
            </motion.div>

            <motion.ul
              {...fadeUp(0.24)}
              className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-sm font-medium text-brown-100/80"
            >
              <li className="flex items-center gap-2">
                <BadgeCheck className="h-4 w-4 text-yolk-400" /> 3 graded sizes
              </li>
              <li className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-yolk-400" /> 4 delivery days a week
              </li>
              <li className="flex items-center gap-2">
                <Wallet className="h-4 w-4 text-yolk-400" /> Bank transfer or COD
              </li>
            </motion.ul>
          </div>

          {/* Right content — interactive 3D scene */}
          <div className="relative min-h-[320px] flex-1 md:min-h-0">
            <SplineScene
              scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
              className="h-full w-full"
            />
          </div>
        </div>
      </Card>
    </section>
  );
}
