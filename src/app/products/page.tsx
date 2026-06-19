import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, Egg } from "lucide-react";
import { SiteHeader } from "@/components/marketing/site-header";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { getPublicProducts } from "@/lib/data/catalog";
import { SIZE_GRADE_LABELS } from "@/lib/labels";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Products" };

const FALLBACK = [
  { id: "m", name: "Brown Eggs — Medium", gradeLabel: "Medium", weight: "49–55 g" },
  { id: "l", name: "Brown Eggs — Large", gradeLabel: "Large", weight: "56–62 g" },
  { id: "xl", name: "Brown Eggs — Extra Large", gradeLabel: "Extra Large", weight: "63–70 g" },
];

export default async function ProductsPage() {
  const fetched = await getPublicProducts();
  const items = fetched.length
    ? fetched.map((p) => ({
        id: p.id,
        name: p.name,
        gradeLabel: SIZE_GRADE_LABELS[p.size_grade] ?? "",
        weight: p.weight_min_g != null ? `${p.weight_min_g}–${p.weight_max_g} g` : "—",
      }))
    : FALLBACK;

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-7xl px-5 py-16 sm:px-8">
        <Badge variant="sage">Catalogue</Badge>
        <h1 className="mt-4 text-4xl text-brown-900">Wholesale brown eggs</h1>
        <p className="mt-3 max-w-2xl text-pretty text-muted">
          Fresh brown table eggs, graded by size and sold by the tray of 30. Log in to your approved
          account to see live wholesale pricing and place orders.
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {items.map((p) => (
            <div key={p.id} className="rounded-3xl border border-line bg-surface p-7">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brown-50 text-brown-500">
                <Egg className="h-7 w-7" />
              </div>
              <h2 className="mt-5 text-xl text-brown-900">{p.name}</h2>
              <p className="mt-1 text-sm text-muted">{p.gradeLabel} grade</p>
              <dl className="mt-5 space-y-2 border-t border-line pt-4 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted">Weight / egg</dt>
                  <dd className="font-semibold text-brown-800">{p.weight}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted">Sold by</dt>
                  <dd className="font-semibold text-brown-800">Tray of 30</dd>
                </div>
              </dl>
              <Link
                href="/login"
                className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-brown-600 hover:text-brown-800"
              >
                Log in for pricing <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ))}
        </div>

        <div className="mt-12 rounded-3xl border border-line bg-brown-50 p-8 text-center">
          <h2 className="text-2xl text-brown-900">Ready to order?</h2>
          <p className="mt-2 text-sm text-muted">
            Register your business to unlock wholesale pricing and delivery.
          </p>
          <Link href="/register" className={cn(buttonVariants(), "mt-5")}>
            Register your business <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </main>
    </>
  );
}
