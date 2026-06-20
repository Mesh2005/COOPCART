import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "CoopCart — Abeyrathna Farms",
    short_name: "CoopCart",
    description:
      "Wholesale brown egg ordering for shops, bakeries, restaurants, and hotels.",
    start_url: "/",
    display: "standalone",
    background_color: "#fbf7f0",
    theme_color: "#6f4a2e",
    categories: ["business", "food", "shopping"],
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
