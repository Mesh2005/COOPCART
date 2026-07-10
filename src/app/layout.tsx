import type { Metadata, Viewport } from "next";
import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";
import { SITE_URL } from "@/lib/env";
import { ChatWidget } from "@/components/chat/chat-widget";
import { Toaster } from "@/components/ui/toaster";
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

const DESCRIPTION =
  "Order farm-fresh wholesale brown eggs from Abeyrathna Farms. Graded by size, priced by the tray, and delivered on a schedule your shop, bakery, or kitchen can rely on.";

export const metadata: Metadata = {
  title: {
    default: "CoopCart — Wholesale Eggs by Abeyrathna Farms",
    template: "%s · CoopCart",
  },
  description: DESCRIPTION,
  metadataBase: new URL(SITE_URL),
  applicationName: "CoopCart",
  keywords: [
    "wholesale eggs",
    "brown eggs",
    "egg supplier Sri Lanka",
    "Abeyrathna Farms",
    "bakery egg supply",
    "restaurant egg supply",
    "egg trays",
  ],
  authors: [{ name: "Abeyrathna Farms" }],
  openGraph: {
    type: "website",
    siteName: "CoopCart",
    title: "CoopCart — Wholesale Eggs by Abeyrathna Farms",
    description: DESCRIPTION,
    url: SITE_URL,
    locale: "en_LK",
  },
  twitter: {
    card: "summary_large_image",
    title: "CoopCart — Wholesale Eggs by Abeyrathna Farms",
    description: DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#6F4A2E",
  width: "device-width",
  initialScale: 1,
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
      <body className="min-h-dvh font-sans antialiased">
        <a
          href="#main-content"
          className="sr-only z-[100] rounded-full bg-brown-700 px-4 py-2 text-sm font-medium text-cream focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        >
          Skip to content
        </a>
        {children}
        <ChatWidget />
        <Toaster />
      </body>
    </html>
  );
}
