"use client";

import { useEffect, useState } from "react";
import { MapPin, ExternalLink } from "lucide-react";
import { useReducedMotion } from "framer-motion";
import { HeroDashboard } from "./hero-dashboard";
import { cn } from "@/lib/utils";

const FARM_LAT = 7.455189;
const FARM_LNG = 80.0460522;
const MAP_SRC = `https://maps.google.com/maps?q=${FARM_LAT},${FARM_LNG}&z=15&output=embed`;
const DIRECTIONS = "https://maps.app.goo.gl/VVpSA1Y6UsKzCBKR7";

function FarmMapWindow() {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-surface shadow-[0_30px_60px_-25px_rgba(61,42,28,0.45)]">
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <span className="flex items-center gap-2 text-sm font-semibold text-brown-900">
          <MapPin className="h-4 w-4 text-[#d9833f]" /> Find us
        </span>
        <a
          href={DIRECTIONS}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-xs font-medium text-brown-600 hover:text-brown-800"
        >
          Directions <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
      <iframe
        title="Abeyrathna Farm location"
        src={MAP_SRC}
        loading="lazy"
        className="w-full flex-1 border-0"
      />
      <div className="border-t border-line px-4 py-3">
        <p className="text-sm font-semibold text-brown-900">Abeyrathna Farms</p>
        <p className="text-xs text-muted">
          Galahitiyawa, Sri Lanka · delivering Mon · Wed · Fri · Sat
        </p>
      </div>
    </div>
  );
}

/** Auto-alternating hero: the order dashboard window and the farm-map window. */
export function HeroShowcase() {
  const reduce = useReducedMotion();
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    if (reduce) return;
    const t = setInterval(() => setSlide((s) => (s + 1) % 2), 6500);
    return () => clearInterval(t);
  }, [reduce]);

  return (
    <div className="relative w-full">
      <div className="relative">
        <div
          className={cn(
            "transition-opacity duration-700",
            slide === 0 ? "opacity-100" : "pointer-events-none opacity-0",
          )}
        >
          <HeroDashboard />
        </div>
        <div
          className={cn(
            "absolute inset-0 transition-opacity duration-700",
            slide === 1 ? "opacity-100" : "pointer-events-none opacity-0",
          )}
        >
          <FarmMapWindow />
        </div>
      </div>

      <div className="mt-6 flex justify-center gap-2">
        {["Dashboard", "Farm location"].map((label, i) => (
          <button
            key={label}
            type="button"
            onClick={() => setSlide(i)}
            aria-label={`Show ${label}`}
            className={cn(
              "h-1.5 rounded-full transition-all",
              slide === i ? "w-6 bg-brown-500" : "w-2 bg-brown-200 hover:bg-brown-300",
            )}
          />
        ))}
      </div>
    </div>
  );
}
