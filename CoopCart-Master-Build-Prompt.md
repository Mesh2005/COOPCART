# CoopCart — Master Build Prompt

> Paste this entire file into Claude Code as the build instruction for the project.
> It is the single source of truth. Build the **complete** system described below — do not
> skip sections, pages, flows, validation, data structures, or backend wiring.

---

## 0. Mission & Quality Bar

You are building **CoopCart**, a production-grade **B2B wholesale egg ordering platform** for
**Abeyrathna Farms**, a real chicken/egg farm in Sri Lanka. It replaces phone/text/manual-book
ordering with a structured cloud system covering customers, products, wholesale pricing, orders,
payments, inventory, and delivery.

Treat this as a **real commercial system**, not a student demo. The bar is: clean architecture,
strong typing, secure data access, an **elite, premium, memorable UI**, and a complete, coherent
feature set that works end to end. Favor correctness and completeness over shortcuts. Where a
detail is unspecified, make a sensible, professional decision consistent with the rest of this spec.

The platform has **three surfaces**:
1. **Public website + branding** — marketing/landing pages that sell the farm's credibility.
2. **Customer portal** — approved wholesale businesses browse, order, pay, and track.
3. **Admin/staff dashboard** — operate the whole business (orders, stock, payments, delivery, reports).

---

## 1. Tech Stack (use exactly this)

- **Framework:** Next.js (latest, **App Router**) + **TypeScript** (strict mode).
- **Styling:** Tailwind CSS + **shadcn/ui** components, themed to the brand below.
- **Animation:** **Framer Motion** for transitions/micro-interactions; CSS for lightweight motion.
  Optional subtle 3D egg on the hero via `@react-three/fiber` (keep it performant, hero only).
- **Backend / DB:** **Supabase** — Postgres, Auth, Storage, **Realtime**, Row-Level Security (RLS),
  and Edge Functions / Postgres RPC for transactional logic.
- **Data access:** Server Components + **Server Actions** for mutations; **TanStack Query** for
  client-side realtime/cached reads where needed.
- **Forms & validation:** **React Hook Form + Zod** (shared Zod schemas for client + server).
- **Charts:** **Recharts** for the analytics dashboard.
- **Email:** **Resend** (transactional emails) via a server action / Edge Function.
- **i18n:** **next-intl** — English (default), Sinhala, Tamil.
- **Tables:** TanStack Table for sortable/filterable/paginated admin data grids.
- **Dates:** `date-fns` (+ `date-fns-tz` for the Asia/Colombo cut-off logic).
- **Hosting target:** Vercel (frontend) + Supabase (managed backend). Everything must run on free tiers initially.
- **Icons:** `lucide-react`.

Generate proper **SQL migrations** for all schema + RLS, and a **seed script** for the data in §20.

---

## 2. Brand & Design System (ELITE UI — this matters a lot)

The first impression is critical. Build a UI that feels **fresh, clean, premium, trustworthy, and
warm** — unmistakably an **egg farm wholesale** business. No generic templates, no flat default
shadcn look. Every screen is intentionally designed.

### Visual identity
- **Theme:** brown eggs, farm freshness, golden yolk warmth, wholesale supply, professional ordering.
- **Mood:** premium-rustic — warm earthy tones + crisp modern layout + airy whitespace.

### Color palette (define as CSS variables + Tailwind theme; support light theme primarily, dark theme for admin optional)
- Background / eggshell cream: `#FBF7F0`
- Surface / card: `#FFFFFF`
- Primary brown (rich farm brown): `#6F4A2E`
- Primary brown deep: `#3D2A1C`
- Brown soft: `#9C6B43`
- Accent — golden yolk: `#F2B441`  · yolk deep: `#E29A1F`
- Fresh farm green (freshness/success cues): `#6B8E5A` · deep `#4F6B43`
- Text charcoal: `#2A231D` · muted `#8A7B6C`
- Border / hairline: `#EAE0D2`
- Semantic: success `#5B8C5A`, warning `#E0A82E`, danger `#C0492F`, info `#3E6B8A` (tuned warm).
- Use accessible contrast (WCAG AA) for all text.

### Typography
- **Headings / display:** `Fraunces` (warm modern serif — editorial, premium farm feel).
- **Body / UI:** `Plus Jakarta Sans` (or `Inter`).
- **Sinhala:** `Noto Sans Sinhala`. **Tamil:** `Noto Sans Tamil`. Load per active locale.
- Establish a clear type scale; generous line-height; confident large headings on the landing page.

### Shape, spacing, depth
- Rounded, organic feel: `rounded-xl`/`rounded-2xl` on cards, soft layered shadows, subtle paper/linen
  grain texture in hero/section backgrounds. Consistent 4/8px spacing scale. Strong visual hierarchy.

### Motion (purposeful, smooth, never excessive — always respect `prefers-reduced-motion`)
- Hero: gently **animated egg tray** (eggs settle / subtle float / soft parallax), optional 3D egg.
- Scroll-reveal section entrances; staggered card reveals.
- Card **hover lift** + shadow bloom; button press feedback.
- **Add-to-cart micro-interaction**: an egg "drops" into the tray icon and the cart count bumps.
- Dashboard **KPI count-up** animations; animated chart draw-in.
- **Skeleton shimmer** loaders; smooth **page transitions** (fade/slide).
- Animated success state (checkmark / egg stamp) on order placed & payment verified.

### Imagery & illustration
- High-quality farm/egg photography (golden-hour farm, brown eggs close-up, trays, hens, crates).
  Use royalty-free/placeholder images wired through `next/image`; make swapping real photos trivial.
- Custom **SVG egg & tray illustrations** for empty states, section accents, loaders.

### Component system (build once, reuse everywhere — total visual consistency)
Buttons (primary/secondary/ghost/destructive), Card, StatCard/KPI, Badge (order + payment status
colors), DataTable, KanbanBoard, ProductCard, TrayQuantityStepper, PriceTierTable, CartDrawer,
CheckoutStepper, FileDropzone (slip upload w/ preview), Toast, Dialog/Sheet, EmptyState, Skeleton,
Charts, Sidebar, Topbar, LanguageSwitcher, Avatar/Tabs/Tooltip, and RHF+Zod form fields.

Fully **responsive** (mobile-first): mobile nav drawer, admin tables collapse to cards on small
screens, touch-friendly targets. Works on desktop, tablet, and phone. **Accessible**: semantic HTML,
focus states, ARIA, keyboard navigation, alt text.

---

## 3. Information Architecture (build every page)

### Public (no login)
- `/` Landing/branding: hero (animated tray + value prop + CTA), why-CoopCart/value props,
  product highlights (Brown M/L/XL with "log in for wholesale pricing"), how wholesale ordering
  works (steps), freshness/quality + trust signals, delivery coverage teaser, testimonials, FAQ,
  final CTA (register your business), footer.
- `/about` the farm story, scale, quality standards.
- `/products` public catalog preview (images, grades, weight ranges; **prices hidden until approved login**).
- `/contact` contact form + farm details + map placeholder.
- `/login`, `/register` (multi-step **business registration**), `/forgot-password`, `/reset-password`.
- `/legal/terms`, `/legal/privacy`.
- Localized: every public page works in EN/SI/TA.

### Customer portal (approved business buyers)
- `/app` dashboard: welcome, account status, KPIs (orders this month, spend, pending payments),
  recent orders, **quick reorder**, announcements.
- `/app/catalog` + `/app/catalog/[product]` with wholesale pricing, tier table, stock status, stepper.
- `/app/cart` cart with min-order + tier pricing live calculation.
- `/app/checkout` stepper: fulfillment (delivery/pickup) → zone/address + **date picker** (respects
  delivery days + 6 PM cut-off + blackout dates) → payment method → review → place order.
- `/app/orders` + `/app/orders/[id]`: order detail + **visual order tracking timeline** + slip upload
  (bank transfer) + invoice/summary + reorder.
- `/app/payments` payment history + upload/replace slip + verification status.
- `/app/profile` business profile, contacts, addresses, password, **language preference**.
- `/app/notifications` in-app notification center.

### Admin/staff dashboard (role-gated)
- `/admin` overview: KPI cards (count-up), revenue & orders charts, pending actions
  (payments to verify, accounts to approve, low stock), today's deliveries.
- `/admin/orders` **Kanban order board** (drag across status columns) + table view + `/[id]` detail
  (items, customer, payment, fulfillment, status actions, assign delivery, internal notes, print).
- `/admin/payments` verification queue (view slip, confirm/reject, record COD).
- `/admin/products` CRUD products, grades, colors, weight ranges, images, **per-grade prices**,
  **price tiers**, activate/deactivate.
- `/admin/inventory` stock levels, **daily egg-production input**, stock movement log, low-stock alerts.
- `/admin/customers` business accounts, **approval queue**, profiles, order history, credit/COD cap, suspend.
- `/admin/delivery` manage zones, fees, delivery days, **blackout dates**, assign & track deliveries.
- `/admin/reports` analytics (see §14) with date-range filters + export (CSV/PDF).
- `/admin/staff` staff users & **role assignment** (RBAC).
- `/admin/settings` **bank account details** (editable, see §9), payment methods on/off, order cut-off
  time, minimum order, currency, site content, languages, email templates.

---

## 4. User Roles & Access (RBAC via Supabase RLS)

- **customer** — an approved business buyer; sees only their own data.
- **delivery** — sees assigned deliveries; updates delivery status only.
- **inventory** — manages products, prices, stock.
- **sales** — manages orders, verifies payments, manages customers/approvals.
- **manager** — all operations + all reports (no system/role settings).
- **admin** — full control incl. staff & role management and settings.

Enforce permissions in **both** the UI (hide/disable) and the database (**RLS policies** — the real
security boundary). New customer accounts start as `pending` and **cannot order until an admin/sales
approves** them.

---

## 5. Data Model (Postgres / Supabase)

Create these tables with sensible PKs (uuid), FKs, timestamps (`created_at`, `updated_at`), and RLS.
Use Postgres **enums** where listed.

**Enums**
- `user_role`: admin, manager, sales, inventory, delivery, customer
- `account_status`: pending, approved, suspended, rejected
- `business_type`: shop, bakery, restaurant, hotel, catering, wholesaler, other
- `egg_color`: brown, white, tinted
- `size_grade`: small, medium, large, extra_large, jumbo, mixed
- `order_status`: pending, confirmed, packed, out_for_delivery, ready_for_pickup, delivered, completed, cancelled
- `payment_method`: bank_transfer, cod
- `payment_status`: unpaid, slip_uploaded, verified, rejected, paid_cod
- `fulfillment_type`: delivery, pickup
- `stock_movement_type`: production_in, reserve, release, fulfill, adjustment, wastage

**Tables**
- `profiles` (1:1 with `auth.users`): id, role `user_role`, full_name, phone, email, preferred_language, is_active.
- `businesses`: id, owner_user_id → profiles, business_name, business_type, br_number (nullable),
  contact_person, phone, email, address_line1/line2, city, delivery_zone_id (nullable),
  status `account_status`, cod_limit (nullable), notes, approved_by, approved_at.
- `products`: id, name, egg_color, size_grade, weight_min_g, weight_max_g, description,
  image_url, eggs_per_tray (default 30), is_active.
- `product_prices`: id, product_id, price_per_tray (current), effective_from (history-friendly), set_by.
- `price_tiers`: id, product_id, min_qty_trays, max_qty_trays (nullable = ∞), price_per_tray,
  is_custom_quote (bool, for 50+).
- `inventory`: product_id (PK/unique), trays_on_hand, trays_reserved, low_stock_threshold, updated_at.
  (available = trays_on_hand − trays_reserved)
- `stock_movements`: id, product_id, change_trays (+/−), type `stock_movement_type`, order_id (nullable),
  note, created_by, created_at.
- `carts` / `cart_items`: cart per user; cart_items(product_id, qty_trays). (Cart may be client-state +
  persisted; persist for logged-in users.)
- `orders`: id, order_number (human, e.g. `CC-2026-00001`), business_id, status `order_status`,
  fulfillment_type, delivery_zone_id (nullable), delivery_address (snapshot), scheduled_date,
  payment_method, payment_status, subtotal, delivery_fee, total, currency ('LKR'), customer_note,
  internal_note, assigned_delivery_user_id (nullable), placed_at, confirmed_at, delivered_at, cancelled_at, cancel_reason.
- `order_items`: id, order_id, product_id, **product_name_snapshot, grade_snapshot, weight_range_snapshot,
  unit_price_snapshot**, qty_trays, line_total. (Snapshots make history price-stable.)
- `payments`: id, order_id, method, amount, status `payment_status`, slip_url (Storage path), reference,
  uploaded_at, verified_by, verified_at, reject_reason.
- `delivery_zones`: id, name, base_fee, per_tray_fee, delivery_days (e.g. ['mon','wed','fri','sat']),
  is_active.
- `delivery_blackout_dates`: id, zone_id (nullable = all), date, reason.
- `deliveries`: id, order_id, assigned_user_id, status, delivered_at, proof_note.
- `bank_accounts`: id, account_name, bank_name, branch, account_number, instructions, is_active.
  (Admin-editable. **Never hard-code real values** — seed with clearly-marked placeholders.)
- `app_settings`: singleton row — order_cutoff_time (default 18:00), min_order_trays (default 5),
  currency ('LKR'), cod_enabled (bool), bank_transfer_enabled (bool, default true), timezone ('Asia/Colombo'),
  default_locale, contact info.
- `notifications`: id, user_id, type, title, body, link, is_read, created_at.
- `audit_log` (advanced): id, actor_user_id, action, entity, entity_id, meta(jsonb), created_at.

**RLS essentials**
- Public can `select` only `is_active` products, prices/tiers, zones (for catalog/landing) — but
  **prices are only returned to approved customers/staff** (gate via policy or a view).
- A customer can read/write only rows tied to their own `business_id` (orders, payments, cart, profile).
- Staff policies scoped by role; admin full access. All writes to stock/orders go through RPC (below).

---

## 6. Wholesale Pricing Engine

- Products are **egg size grades** (grade = weight class). Larger grade = higher price per tray.
- **Selling unit = tray of 30.** All quantities, stock, and pricing are in **trays**.
- **Minimum order = `min_order_trays` (default 5).** Block checkout below it with a clear message.
- **Quantity price tiers** (per product, admin-editable; seed defaults):
  - 5–9 trays → standard wholesale price
  - 10–24 trays → small bulk discount
  - 25–49 trays → medium bulk discount
  - 50+ trays → best price; also surface a **"Request custom quote"** option.
- Resolve the unit price from the tier matching the line quantity; show the active tier and savings in
  cart. **Persist `unit_price_snapshot` on `order_items`** so past orders never change when prices update.
- Admin can update any price anytime (prices fluctuate with size, supply, feed cost, market).

---

## 7. Inventory & Real-time Stock

- Stock tracked per product in **trays**: `trays_on_hand`, `trays_reserved`; **available = on_hand − reserved**.
- **Reserve on order placement** (decrement availability), **fulfill on confirm** (reduce on_hand &
  clear reserve), **release on cancel** (restore). All via an atomic **Postgres RPC / transaction** to
  prevent overselling under concurrency.
- **Block out-of-stock**: products with available ≤ 0 show **Unavailable** and cannot be added/ordered;
  cap quantity to availability with a clear message.
- **Daily production input**: staff add collected eggs (as trays) → `production_in` movement raises stock.
- **Low-stock alerts** when available ≤ threshold (admin dashboard + notification).
- Use **Supabase Realtime** so storefront stock badges and the admin board update live.
- Record every change in `stock_movements` for the audit trail and reports.

---

## 8. Ordering & Checkout Flow

1. Approved customer browses catalog → sees wholesale price + tier table + live stock.
2. Adds trays via stepper (respects availability + min order) → cart (live tier pricing & totals).
3. Checkout stepper: **fulfillment** (delivery/pickup) → if delivery: pick **zone + address** and a
   **delivery date** (only valid delivery days, after the 6 PM previous-day cut-off, excluding blackout
   dates); if pickup: pick a pickup date/slot → **payment method** → **review** (itemized, fee, total in
   LKR) → **place order**.
4. On placement: create order + items (with snapshots), **reserve stock (RPC)**, generate `order_number`,
   set status `pending`, show on-screen confirmation + send email.
5. Bank transfer → prompt to **upload slip** (can also do later from order/payments page).
6. Admin verifies payment / accepts COD → order `confirmed` → proceeds through lifecycle (§11).

Guests cannot order. Everything requires an **approved** business login.

---

## 9. Payments (no gateway)

Two methods, **both admin-toggleable** in settings; **bank transfer is the default/primary** for v1.

- **Bank transfer:** at checkout/order, show the **bank details from `bank_accounts`** (admin-managed,
  placeholders until the owner provides real ones) with **Payment Reference = Order number / business
  name**. Customer **uploads a transfer receipt/screenshot** (Supabase Storage, private bucket, image/pdf,
  size-limited, preview). Admin sees it in the **verification queue**, then **confirms** (→ `verified`,
  order → `confirmed`) or **rejects** with a reason (customer notified to re-upload).
- **COD:** order placed as `unpaid`; confirmed by staff; marked `paid_cod` on delivery; optional
  **COD value cap** per business for risk control.

Never store card data. Never hard-code real bank account numbers.

---

## 10. Delivery & Pickup

- **Zones** (seed): Negombo, Katunayake, Seeduwa, Ja-Ela, Wattala, Colombo suburbs. Admin can add/edit.
- **Delivery fee is variable**, not flat: `base_fee(zone) + per_tray_fee × trays`. **Pickup = free.**
- **Delivery days** (seed): Mon, Wed, Fri, Sat. **Cut-off:** orders before **18:00 Asia/Colombo** the
  previous day qualify for next available delivery day. Enforce in the date picker.
- **Blackout dates** block specific dates per zone (or globally).
- Admin **delivery management**: assign orders to **delivery staff**, track through delivered, capture a
  delivery note/proof. Admin controls all zones/fees/days/blackouts from the panel.

---

## 11. Order Lifecycle & Admin Order Board

- **Status flow:** `pending → confirmed → packed → out_for_delivery (delivery) | ready_for_pickup (pickup)
  → delivered → completed`, with `cancelled` reachable from pre-delivery states (auto-restock on cancel).
- **Payment status** tracked separately: `unpaid / slip_uploaded / verified / rejected / paid_cod`.
- **Admin "board"** = a **Kanban board** with a column per status; staff **drag orders** between columns
  to advance them (with guard rules + confirmations), plus a filterable table view and rich order detail.
- Status changes trigger notifications (§15) and timeline updates on the customer's order-tracking view.

---

## 12. Admin Dashboard (all modules)

Build every module in §3 admin list: overview, orders (board+table+detail), payments verification,
products & pricing, inventory & production, customers & approvals, delivery (zones/fees/days/blackouts/
assignment), reports, staff & roles, settings (bank details, payment toggles, cut-off, min order,
currency, content, languages). Cohesive sidebar + topbar, breadcrumb, role-aware nav, polished tables,
empty states, and confirmations.

---

## 13. Customer Dashboard

Build every module in §3 customer list: dashboard with KPIs + reorder, catalog, cart, checkout, orders
with **visual tracking timeline**, payments + slip upload, profile/business settings (+ language),
notifications. Warm, simple, fast.

---

## 14. Reports & Analytics (advanced)

KPI dashboard + dedicated reports with date-range filters and **CSV/PDF export**:
- **Sales:** revenue & order count by day/week/month/year, average order value, growth trends.
- **Products:** sales by grade, best/worst sellers, tier mix, stock movement, wastage.
- **Customers:** top customers, new vs returning, order frequency, outstanding balances.
- **Orders:** by status, fulfillment time, cancellation rate & reasons.
- **Payments:** bank transfer vs COD, verified vs pending, collections, rejected slips.
- **Delivery:** delivery vs pickup split, orders by zone, deliveries per staff, on-time rate.
- **Inventory:** current stock, daily production logged, low-stock incidents.
Use Recharts; animate draw-in; make charts responsive and accessible (with data tables behind them).

---

## 15. Notifications

- **Email (Resend):** order placed, slip uploaded (to admin/sales), payment verified/rejected, each
  status change, out-for-delivery / ready-for-pickup, delivered, account approved/rejected. Branded,
  localized templates.
- **On-screen:** success/error toasts; an **in-app notification center** per user.
- **SMS:** optional, behind a feature flag — only wire it if a free/low-cost gateway is configured;
  otherwise email + on-screen are sufficient. Don't block the build on SMS.

---

## 16. Internationalization (EN / SI / TA)

- **next-intl** with English (default), **Sinhala**, **Tamil**. Language switcher in header + saved to
  the user profile. All UI chrome fully translated; load Noto Sans Sinhala/Tamil per locale.
- Provide complete message catalogs for all three (translate everything; if unsure, provide best-effort
  Sinhala/Tamil and keep keys consistent). Product/grade names may stay English with optional localized
  fields. Format dates/numbers/currency per locale.

---

## 17. Currency & Formatting

- Currency **LKR** only (no multi-currency). Provide a `formatCurrency` util → e.g. **`Rs. 1,500`** /
  `LKR 1,500` (thousands separators, no decimals for whole rupees; 2 decimals only when needed).
- Timezone **Asia/Colombo** for cut-off and scheduling logic.

---

## 18. Validation, Security & RLS

- **Zod** schemas shared across client + server; validate every form and every server action input.
- **RLS on every table** is the real authorization layer — never trust the client. Test that a customer
  cannot read another business's orders/payments, and that role scopes hold.
- Private Storage buckets for **payment slips** (signed URLs only to the owner + verifying staff) and a
  public/optimized bucket for product images.
- Stock & order mutations through **atomic RPC/transactions**. Guard status transitions server-side.
- Auth: email/password (Supabase Auth) + password reset; protected routes via middleware; approval gate
  for ordering. Rate-limit auth + upload endpoints. Sanitize file uploads (type/size).

---

## 19. Non-functional Requirements

- **Responsive** and beautiful on desktop/tablet/mobile/any size; **accessible** (WCAG AA, keyboard,
  ARIA, focus, reduced-motion).
- **Performance:** optimized images (`next/image`), code-split, lazy-load heavy/3D bits, fast LCP on
  landing; skeletons over spinners.
- **SEO** for public pages (metadata, OpenGraph, sitemap, semantic structure).
- **Code quality:** strict TypeScript, ESLint + Prettier, clear folder structure, reusable components,
  typed Supabase client (generated types), `.env.example`, and a thorough `README` (setup, migrations,
  seed, env, deploy).
- Error boundaries, empty states, and graceful loading/empty/error for every data view.

---

## 20. Seed Data

- **Settings:** min_order_trays = 5, order_cutoff_time = 18:00, currency = LKR, timezone = Asia/Colombo,
  bank_transfer_enabled = true, cod_enabled = true, default_locale = en.
- **Active products (brown table eggs):**
  - Brown Eggs — Medium · 49–55 g · 30/tray
  - Brown Eggs — Large · 56–62 g · 30/tray
  - Brown Eggs — Extra Large · 63–70 g · 30/tray
- **Inactive (admin-only) examples:** White M/L/XL, Tinted, Small, Jumbo, Mixed — created but `is_active=false`.
- **Price tiers** per active product (placeholder LKR values, clearly marked TODO for the owner):
  5–9 / 10–24 / 25–49 / 50+ with decreasing per-tray price; 50+ flagged custom-quote.
- **Inventory:** seed each active product with a starting trays_on_hand and a low_stock_threshold.
- **Delivery zones:** Negombo, Katunayake, Seeduwa, Ja-Ela, Wattala, Colombo suburbs — each with a
  placeholder base_fee + per_tray_fee and delivery_days [mon,wed,fri,sat].
- **Bank account:** ONE placeholder row with `account_name: "[TO BE PROVIDED BY FARM OWNER]"`, etc.
- **Users:** one `admin`, one `sales`, one `inventory`, one `delivery` staff, and 1–2 sample **approved**
  business customers, plus a couple of sample orders across different statuses to demo the board & reports.

> Mark every placeholder money value and the bank details with a clear `TODO` so the owner replaces them.

---

## 21. Project Structure (suggested)

```
/app            (public, /app customer, /admin segments; route groups + layouts)
/components/ui  (shadcn) and /components/* (domain components)
/lib            (supabase client, auth, pricing, stock, delivery, currency, i18n, email)
/server         (server actions, RPC wrappers, zod schemas)
/db             (migrations .sql, seed.ts, generated types)
/messages       (en.json, si.json, ta.json)
/public         (images, svg illustrations)
```

---

## 22. Environment & Setup

Provide `.env.example` with: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
`SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `NEXT_PUBLIC_SITE_URL`, (optional `SMS_*`).
README must explain: create Supabase project → run migrations → run seed → set env → `dev` → deploy.

---

## 23. Build Phases (execute in order; keep the app runnable after each)

1. **Foundation:** Next.js + TS + Tailwind + shadcn, theme tokens, fonts, layout shells, i18n scaffold.
2. **Design system:** core components + motion primitives + a styleguide page.
3. **Supabase:** schema migrations, enums, RLS, generated types, storage buckets, seed.
4. **Auth & onboarding:** login/register (business multi-step), password reset, approval gate, role guards.
5. **Catalog & pricing:** products, tiers, public + customer catalog, product detail, realtime stock.
6. **Cart & checkout:** cart, tier pricing, delivery date/zone/cut-off logic, place-order RPC (reserve stock).
7. **Payments:** bank details display, slip upload, COD, admin verification queue.
8. **Orders & lifecycle:** customer tracking timeline, admin **Kanban board** + detail, status transitions,
   stock fulfill/release.
9. **Delivery:** zones/fees/days/blackouts admin + assignment & tracking.
10. **Admin ops:** inventory/production, customers/approvals, staff & roles, settings (bank/toggles/etc.).
11. **Reports & notifications:** analytics dashboard + exports; email + in-app notifications.
12. **Landing & branding:** elite public site, animations, SEO.
13. **Polish:** responsiveness, accessibility, empty/error states, performance, README.

---

## 24. Definition of Done (must all be true)

- [ ] Public landing + branding pages, premium and animated, in EN/SI/TA.
- [ ] Business registration → admin approval → approved login → can order; guests cannot.
- [ ] Catalog with grade/weight, wholesale tier pricing, live stock, min-order enforcement.
- [ ] Cart + checkout with delivery/pickup, zone + variable fee, date picker honoring days/cut-off/blackouts.
- [ ] Order placement reserves stock atomically; cancel restocks; out-of-stock blocked.
- [ ] Bank-transfer slip upload + admin verification; COD path; both toggleable; bank details admin-editable.
- [ ] Order lifecycle works; admin **Kanban board** drag-to-advance; customer tracking timeline.
- [ ] Admin: products/pricing, inventory/production, customers/approvals, delivery mgmt, staff & roles, settings.
- [ ] Advanced reports with filters + CSV/PDF export; KPI dashboard with charts.
- [ ] Email + in-app notifications fire on the key events.
- [ ] RLS verified (cross-tenant isolation + role scopes); private slip storage with signed URLs.
- [ ] Fully responsive + accessible; LKR formatting; Asia/Colombo logic; no console errors.
- [ ] Migrations + seed + README + `.env.example` included; app runs from a clean checkout.

---

## 25. Explicit DO NOT / Out of Scope

- ❌ No card/online-payment **gateway** (bank transfer + COD only).
- ❌ Do **not** hard-code real bank details — use admin-editable placeholders.
- ❌ No AI alerts, feeding predictions, worker daily task checklists, chicken health tracking, death logs,
  or physical QR systems.
- ❌ No multi-currency.
- ❌ Don't ship a basic/generic/template look, and don't overdo animations (must stay fast & usable).

---

**Build the complete system above in a clean, coherent, production-grade implementation.
This is the highest-quality work for a real egg-farm wholesale business — make it excellent.**
