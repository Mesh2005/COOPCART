# CoopCart

**B2B wholesale egg ordering platform for Abeyrathna Farms.**

CoopCart digitalizes the farm's sales pipeline — replacing phone/WhatsApp orders with a structured web experience covering catalog browsing, bulk-tier pricing, atomic order placement, bank-transfer slip upload, and an admin operations console.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 (CSS-first `@theme`) |
| Animations | Framer Motion |
| Database | Supabase (PostgreSQL + RLS) |
| Auth | Supabase Auth (email/password) |
| Storage | Supabase Storage (payment slips, product images) |
| Validation | Zod + React Hook Form |
| Icons | Lucide React |
| Fonts | Fraunces (display) · Plus Jakarta Sans (body) |

---

## Features

### Customer Portal (`/app`)
- Business registration with admin approval gate (B2B-only, no guest checkout)
- Live catalogue with bulk-tier pricing (5–9 / 10–24 / 25–49 / 50+ trays)
- Cart with real-time price recalculation and minimum-order enforcement (5 trays)
- Checkout: delivery zone, day/cutoff-aware date picker, payment method selection
- Atomic order placement — stock reserved transactionally via Postgres RPC
- Order detail with progress timeline (Pending → Confirmed → Packed → Delivered)
- In-app bank-transfer slip upload (private Supabase Storage bucket)

### Admin Console (`/admin`)
- Payment verification queue (view slip, approve or reject with reason)
- Order management Kanban board (drag status, set_order_status RPC)
- Customer approval queue (approve or suspend businesses)
- Inventory and production input (add_production RPC)
- Delivery zone management (zones, fees, blackout dates, staff assignment)
- Products and pricing editor (grades, base prices, bulk tiers)
- Staff and roles management (RBAC via Supabase RLS)
- App settings (bank details, payment toggles, cutoff time, min order)
- Analytics reports (revenue, grades, orders, payments) with CSV export

---

## Project Structure

```
src/
├── app/
│   ├── (auth)/          # Login & register (route group)
│   ├── admin/           # Admin console
│   ├── app/             # Customer portal
│   └── page.tsx         # Public landing page
├── components/
│   ├── catalog/         # AddToCart, PriceTiers
│   ├── cart/            # CartView
│   ├── checkout/        # CheckoutForm
│   ├── dashboard/       # NavLinks, LogoutButton
│   ├── marketing/       # Hero, SiteHeader, EggTray, Reveal
│   ├── orders/          # OrderTimeline, SlipUpload
│   └── ui/              # Button, Badge, Input, Field, Alert, Select
├── lib/
│   ├── actions/         # Server actions (auth, cart, orders)
│   ├── data/            # Data-fetch helpers (catalog, cart, orders)
│   ├── supabase/        # Server / browser / admin clients
│   ├── auth.ts          # requireProfile / requireStaff helpers
│   ├── delivery-dates.ts
│   ├── pricing.ts
│   └── types.ts         # Domain TypeScript types
└── proxy.ts             # Next.js 16 middleware (named "proxy")

supabase/
├── migrations/
│   ├── 20260619100000_schema.sql    # 18 tables, enums, triggers
│   ├── 20260619100001_functions.sql # place_order, verify_payment, etc.
│   └── 20260619100002_rls.sql       # Row-Level Security on all tables
└── seed.sql                         # Products, zones, settings, pricing tiers
```

---

## Local Development

### 1. Clone and install

```bash
git clone https://github.com/Mesh2005/COOPCART.git
cd COOPCART
npm install
```

### 2. Set up Supabase

1. Create a free project at supabase.com
2. In the SQL Editor, run the three migration files in order:
   - `supabase/migrations/20260619100000_schema.sql`
   - `supabase/migrations/20260619100001_functions.sql`
   - `supabase/migrations/20260619100002_rls.sql`
3. Run `supabase/seed.sql` to populate initial data

### 3. Configure environment

```bash
cp .env.example .env.local
```

Fill in your Supabase project URL, anon key, and service-role key.

> **Note:** Bank account details and real prices are placeholder values. The farm owner must supply these via Admin > Settings before going live.

### 4. Run the dev server

```bash
npm run dev
```

Open http://localhost:3000.

---

## Roles and Access

| Role | Access |
|---|---|
| `customer` | Own orders, cart, catalogue (approved businesses only) |
| `sales` | All orders, customer list |
| `inventory` | Inventory and production input |
| `delivery` | Assigned deliveries |
| `manager` | All of the above |
| `admin` | Full access including settings and staff management |

Access is enforced at the database level via Supabase Row-Level Security.

---

## Delivery Zones

Negombo · Katunayake · Seeduwa · Ja-Ela · Wattala · Colombo suburbs

Delivery days: **Mon / Wed / Fri / Sat** — orders must be placed before **6:00 PM** the day prior.

---

## Payments

- **Bank transfer** (primary) — customer uploads slip in-app; admin verifies before confirming order
- **Cash on delivery** — admin-toggleable
- Payment reference = order number (format: `CC-YYYY-#####`)

No card gateway is in scope.

---

## Environment Variables

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon (public) key |
| `SUPABASE_SERVICE_ROLE_KEY` | Service-role key (server-only, bypasses RLS) |
| `NEXT_PUBLIC_SITE_URL` | Canonical site URL |
| `RESEND_API_KEY` | Resend API key for transactional emails (optional) |

---

## License

Private — Abeyrathna Farms. Not for redistribution.
