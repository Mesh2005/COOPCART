import { MapPin } from "lucide-react";

/** Compact embedded map of the farm — used on order tracking. */
export function FarmMap({ label }: { label?: string }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-surface">
      <div className="flex items-center gap-2 border-b border-line px-5 py-3">
        <MapPin className="h-4 w-4 text-brown-500" />
        <h2 className="font-display text-sm font-semibold text-brown-900">
          {label ?? "Abeyrathna Farms"}
        </h2>
        <a
          href="https://maps.app.goo.gl/VVpSA1Y6UsKzCBKR7"
          target="_blank"
          rel="noreferrer"
          className="ml-auto text-xs font-medium text-brown-600 hover:text-brown-800"
        >
          Directions
        </a>
      </div>
      <iframe
        src="https://maps.google.com/maps?q=7.455189,80.0460522&z=14&output=embed"
        title="Abeyrathna Farms location"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="h-56 w-full border-0"
      />
    </div>
  );
}
