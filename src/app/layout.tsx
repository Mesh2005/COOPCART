import type { Metadata } from "next";
import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const sans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "CoopCart — Wholesale Eggs by Abeyrathna Farms",
    template: "%s · CoopCart",
  },
  description:
    "Order farm-fresh wholesale brown eggs from Abeyrathna Farms. Graded by size, priced by the tray, and delivered on a schedule your shop, bakery, or kitchen can rely on.",
  metadataBase: new URL("https://coopcart.example"),
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${sans.variable} ${display.variable} h-full`}
    >
      <body className="min-h-dvh font-sans antialiased">{children}</body>
    </html>
  );
}
