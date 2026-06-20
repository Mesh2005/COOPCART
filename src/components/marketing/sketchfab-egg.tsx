"use client";

import { cn } from "@/lib/utils";

/**
 * Interactive 3D egg-carton model embedded from Sketchfab.
 * "Eggs" by Rodrigo del Pozo (@rodrigodelpozo99) — used via Sketchfab embed,
 * which carries the author's attribution as required.
 */
const MODEL_ID = "129cc25852fd4a9e83d95ed8757d36d4";

const params = new URLSearchParams({
  autospin: "0.3",
  autostart: "1",
  preload: "1",
  transparent: "1",
  ui_theme: "dark",
  ui_infos: "0",
  ui_controls: "1",
  ui_stop: "0",
  ui_watermark_link: "0",
  scrollwheel: "0",
  dnt: "1",
});

export function SketchfabEgg({ className }: { className?: string }) {
  return (
    <div className={cn("relative", className)}>
      <div className="relative aspect-square w-full overflow-hidden rounded-[1.75rem] border border-brown-200/60 bg-cream shadow-[0_30px_60px_-25px_rgba(61,42,28,0.45)]">
        <iframe
          title="Eggs — 3D model by Rodrigo del Pozo"
          src={`https://sketchfab.com/models/${MODEL_ID}/embed?${params.toString()}`}
          allow="autoplay; fullscreen; xr-spatial-tracking"
          allowFullScreen
          loading="eager"
          className="h-full w-full border-0"
        />
      </div>
      <p className="mt-2 text-center text-[11px] text-muted">
        3D “Eggs” by{" "}
        <a
          href="https://sketchfab.com/3d-models/eggs-129cc25852fd4a9e83d95ed8757d36d4"
          target="_blank"
          rel="noreferrer"
          className="underline hover:text-brown-700"
        >
          Rodrigo del Pozo
        </a>{" "}
        · Sketchfab
      </p>
    </div>
  );
}
