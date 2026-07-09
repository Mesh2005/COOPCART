import Link from "next/link";
import {
  ArrowRight,
  Boxes,
  CalendarClock,
  ClipboardCheck,
  Egg,
  Leaf,
  Mail,
  MapPin,
  PackageCheck,
  Phone,
  ShieldCheck,
  Store,
  Truck,
  Wallet,
} from "lucide-react";
import { SiteHeader } from "@/components/marketing/site-header";
import { Hero } from "@/components/marketing/hero";
import { Reveal } from "@/components/marketing/reveal";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Logo } from "@/components/brand/logo";
import { CountUp } from "@/components/ui/count-up";
import { cn } from "@/lib/utils";

const SHELL = "mx-auto w-full max-w-7xl px-5 sm:px-8";

const stats = [
  { value: "30", label: "eggs per tray" },
  { value: "5", label: "trays minimum order" },
  { value: "4", label: "delivery days / week" },
  { value: "6", label: "delivery zones" },
];

const products = [
  { name: "Brown Eggs — Medium", weight: "49–55 g", note: "Everyday baking & retail" },
  { name: "Brown Eggs — Large", weight: "56–62 g", note: "The kitchen favourite" },
  { name: "Brown Eggs — Extra Large", weight: "63–70 g", note: "Premium grade" },
];

const steps = [
  {
    icon: Store,
    title: "Register your business",
    body: "Create an account with your shop, bakery, restaurant, hotel, or catering details.",
  },
  {
    icon: ShieldCheck,
    title: "Get approved",
    body: "Our team verifies your business and unlocks live wholesale pricing for your account.",
  },
  {
    icon: Boxes,
    title: "Order by the tray",
    body: "Pick your grades and quantities. Bulk tiers apply automatically as your order grows.",
  },
  {
    icon: Truck,
    title: "Delivery or pickup",
    body: "Choose a delivery date in your zone, or collect from the farm. Pay by transfer or COD.",
  },
];

const features = [
  {
    icon: Leaf,
    title: "Graded for freshness",
    body: "Every tray is sorted by size and weight class, so you get consistent, fresh table eggs in every order.",
  },
  {
    icon: Boxes,
    title: "Real wholesale pricing",
    body: "Transparent per-tray prices with automatic bulk discounts at 10, 25, and 50+ trays.",
  },
  {
    icon: CalendarClock,
    title: "Reliable delivery schedule",
    body: "Fixed delivery days with a clear next-day cut-off, so you can plan your stock with confidence.",
  },
  {
    icon: Wallet,
    title: "Pay your way",
    body: "Bank transfer with in-app slip upload, or cash on delivery — verified by our team before dispatch.",
  },
];

const zones = ["Negombo", "Katunayake", "Seeduwa", "Ja-Ela", "Wattala", "Colombo suburbs"];
const days = ["Monday", "Wednesday", "Friday", "Saturday"];

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main id="main-content">
        <Hero />

        {/* Stat band */}
        <section className="border-y border-line bg-surface/60">
          <div className={cn(SHELL, "grid grid-cols-2 gap-6 py-10 sm:grid-cols-4")}>
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <p className="font-display text-4xl font-semibold text-brown-700">
                  <CountUp value={Number(s.value)} />
                </p>
                <p className="mt-1 text-sm text-muted">{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Products */}
        <section id="products" className="py-20 sm:py-24">
          <div className={SHELL}>
            <Reveal className="max-w-2xl">
              <Badge variant="sage">Our catalogue</Badge>
              <h2 className="mt-4 text-3xl text-brown-900 sm:text-4xl">
                Brown table eggs, sorted by grade
              </h2>
              <p className="mt-3 text-pretty text-muted">
                We specialise in fresh brown eggs in three wholesale grades. Larger grades carry a
                higher per-tray price — log in to see live wholesale rates for your account.
              </p>
            </Reveal>

            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {products.map((p, i) => (
                <Reveal key={p.name} delay={i * 0.08}>
                  <div className="group h-full rounded-3xl border border-line bg-surface p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_50px_-30px_rgba(61,42,28,0.5)]">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brown-50 text-brown-500 transition-colors group-hover:bg-yolk-200 group-hover:text-brown-700">
                      <Egg className="h-7 w-7" />
                    </div>
                    <h3 className="mt-5 text-xl text-brown-900">{p.name}</h3>
                    <p className="mt-1 text-sm text-muted">{p.note}</p>
                    <dl className="mt-5 flex items-center justify-between border-t border-line pt-4 text-sm">
                      <dt className="text-muted">Weight / egg</dt>
                      <dd className="font-semibold text-brown-800">{p.weight}</dd>
                    </dl>
                    <dl className="mt-2 flex items-center justify-between text-sm">
                      <dt className="text-muted">Sold by</dt>
                      <dd className="font-semibold text-brown-800">Tray of 30</dd>
                    </dl>
                    <Link
                      href="/login"
                      className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-brown-600 hover:text-brown-800"
                    >
                      Log in for wholesale pricing <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="bg-brown-900 py-20 text-cream sm:py-24">
          <div className={SHELL}>
            <Reveal className="max-w-2xl">
              <Badge className="bg-yolk-400 text-brown-900">How it works</Badge>
              <h2 className="mt-4 text-3xl text-cream sm:text-4xl">
                From sign-up to delivery in four steps
              </h2>
              <p className="mt-3 text-pretty text-brown-100/80">
                A simple, reliable ordering flow built for busy wholesale buyers.
              </p>
            </Reveal>

            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {steps.map((s, i) => (
                <Reveal key={s.title} delay={i * 0.08}>
                  <div className="h-full rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
                    <div className="flex items-center justify-between">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-yolk-400 text-brown-900">
                        <s.icon className="h-6 w-6" />
                      </div>
                      <span className="font-display text-3xl font-semibold text-white/15">
                        0{i + 1}
                      </span>
                    </div>
                    <h3 className="mt-5 text-lg text-cream">{s.title}</h3>
                    <p className="mt-2 text-sm text-brown-100/75">{s.body}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Why CoopCart */}
        <section id="why" className="py-20 sm:py-24">
          <div className={SHELL}>
            <Reveal className="max-w-2xl">
              <Badge variant="sage">Why CoopCart</Badge>
              <h2 className="mt-4 text-3xl text-brown-900 sm:text-4xl">
                Built for wholesale, down to the last egg
              </h2>
            </Reveal>

            <div className="mt-10 grid gap-6 sm:grid-cols-2">
              {features.map((f, i) => (
                <Reveal key={f.title} delay={i * 0.06}>
                  <div className="flex h-full gap-5 rounded-3xl border border-line bg-surface p-7">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sage-300/30 text-sage-600">
                      <f.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-lg text-brown-900">{f.title}</h3>
                      <p className="mt-1.5 text-sm text-muted">{f.body}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Delivery */}
        <section id="delivery" className="py-20 sm:py-24">
          <div className={SHELL}>
            <div className="overflow-hidden rounded-[2rem] border border-line bg-gradient-to-br from-brown-50 to-yolk-100/60">
              <div className="grid gap-10 p-8 sm:p-12 lg:grid-cols-2">
                <Reveal>
                  <Badge variant="brand">Delivery &amp; pickup</Badge>
                  <h2 className="mt-4 text-3xl text-brown-900 sm:text-4xl">
                    Serving the Negombo–Colombo corridor
                  </h2>
                  <p className="mt-3 text-pretty text-muted">
                    We deliver across selected zones on fixed days each week. Place your order before
                    6:00 PM the day before for next delivery day dispatch — or pick up directly from
                    the farm.
                  </p>
                  <div className="mt-6 flex flex-wrap gap-2">
                    {zones.map((z) => (
                      <span
                        key={z}
                        className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1.5 text-sm font-medium text-brown-700"
                      >
                        <MapPin className="h-3.5 w-3.5 text-brown-400" /> {z}
                      </span>
                    ))}
                  </div>
                </Reveal>

                <Reveal delay={0.1}>
                  <div className="rounded-3xl border border-line bg-surface p-7">
                    <div className="flex items-center gap-3">
                      <PackageCheck className="h-5 w-5 text-sage-600" />
                      <h3 className="text-lg text-brown-900">Delivery days</h3>
                    </div>
                    <ul className="mt-4 divide-y divide-line">
                      {days.map((d) => (
                        <li key={d} className="flex items-center justify-between py-3">
                          <span className="font-medium text-brown-800">{d}</span>
                          <span className="text-sm text-muted">Order by 6:00 PM previous day</span>
                        </li>
                      ))}
                    </ul>
                    <Link
                      href="/register"
                      className={cn(buttonVariants({ size: "md" }), "mt-6 w-full")}
                    >
                      Start ordering <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </Reveal>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="pb-24">
          <div className={SHELL}>
            <Reveal>
              <div className="relative overflow-hidden rounded-[2rem] bg-brown-800 px-8 py-14 text-center text-cream sm:px-12">
                <div className="glow-warm pointer-events-none absolute inset-x-0 top-0 h-40" />
                <div className="relative mx-auto max-w-2xl">
                  <ClipboardCheck className="mx-auto h-10 w-10 text-yolk-400" />
                  <h2 className="mt-4 text-3xl text-cream sm:text-4xl">
                    Ready to order wholesale eggs the easy way?
                  </h2>
                  <p className="mt-3 text-pretty text-brown-100/80">
                    Register your business today. Once approved, you’ll have live pricing, bulk
                    tiers, and a delivery schedule at your fingertips.
                  </p>
                  <div className="mt-8 flex flex-wrap justify-center gap-3">
                    <Link
                      href="/register"
                      className={cn(buttonVariants({ variant: "accent", size: "lg" }))}
                    >
                      Create your account <ArrowRight className="h-4 w-4" />
                    </Link>
                    <Link
                      href="/login"
                      className={cn(
                        buttonVariants({ variant: "ghost", size: "lg" }),
                        "text-cream hover:bg-white/10",
                      )}
                    >
                      Log in
                    </Link>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-line bg-surface/60">
        <div className={cn(SHELL, "grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4")}>
          <div>
            <div className="flex items-center text-brown-900">
              <Logo />
            </div>
            <p className="mt-4 max-w-xs text-sm text-muted">
              Wholesale farm-fresh brown eggs, ordered online and delivered on schedule.
            </p>
          </div>

          <div>
            <h4 className="font-display text-sm font-semibold text-brown-900">Explore</h4>
            <ul className="mt-4 space-y-2.5 text-sm text-muted">
              <li><a href="#products" className="hover:text-brown-800">Products</a></li>
              <li><a href="#how" className="hover:text-brown-800">How it works</a></li>
              <li><a href="#delivery" className="hover:text-brown-800">Delivery</a></li>
              <li><a href="#why" className="hover:text-brown-800">Why CoopCart</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display text-sm font-semibold text-brown-900">Account</h4>
            <ul className="mt-4 space-y-2.5 text-sm text-muted">
              <li><Link href="/login" className="hover:text-brown-800">Log in</Link></li>
              <li><Link href="/register" className="hover:text-brown-800">Register business</Link></li>
              <li><Link href="/products" className="hover:text-brown-800">Catalogue</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display text-sm font-semibold text-brown-900">Contact</h4>
            <ul className="mt-4 space-y-2.5 text-sm text-muted">
              <li className="flex items-center gap-2"><Phone className="h-4 w-4 text-brown-400" /> +94 00 000 0000</li>
              <li className="flex items-center gap-2"><Mail className="h-4 w-4 text-brown-400" /> hello@coopcart.lk</li>
              <li className="flex items-center gap-2"><MapPin className="h-4 w-4 text-brown-400" /> Negombo, Sri Lanka</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-line">
          <div className={cn(SHELL, "flex flex-col items-center justify-between gap-3 py-6 text-sm text-muted sm:flex-row")}>
            <p>© {new Date().getFullYear()} Abeyrathna Farms. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <span>Prices in LKR · COD &amp; bank transfer</span>
              <Link href="/admin" className="font-medium text-brown-500 hover:text-brown-700">
                Staff login
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
