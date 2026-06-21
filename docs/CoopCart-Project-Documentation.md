# CoopCart — Project Documentation

**Wholesale Egg Ordering Platform for Abeyrathna Farms**

| | |
|---|---|
| **Project** | CoopCart |
| **Client** | Abeyrathna Farms (poultry / egg producer, Sri Lanka) |
| **Module** | Agile Project Management |
| **Document** | Product & Delivery Documentation (with Story Points) |
| **Version** | 1.0 |
| **Status** | Baseline |
| **Repository** | https://github.com/Mesh2005/COOPCART |

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Project Overview](#2-project-overview)
3. [Stakeholders & Personas](#3-stakeholders--personas)
4. [Scope](#4-scope)
5. [Agile Delivery Framework](#5-agile-delivery-framework)
6. [Estimation Approach (Story Points)](#6-estimation-approach-story-points)
7. [Epics Overview](#7-epics-overview)
8. [Product Backlog](#8-product-backlog)
9. [Release & Sprint Plan](#9-release--sprint-plan)
10. [Detailed User Stories (Samples)](#10-detailed-user-stories-samples)
11. [Technical Architecture](#11-technical-architecture)
12. [Non-Functional Requirements](#12-non-functional-requirements)
13. [Risk Register](#13-risk-register)
14. [Glossary](#14-glossary)
15. [Appendix A — Story Point Reference Scale](#appendix-a--story-point-reference-scale)

---

## 1. Executive Summary

CoopCart is a B2B wholesale e-commerce platform that digitalises the egg sales
pipeline of **Abeyrathna Farms**. It replaces ad-hoc phone/text ordering and
manual record-keeping with a single, role-based web system covering a public
marketing site, a self-service wholesale ordering portal for approved business
buyers, and an operations console for farm staff.

The product was delivered with **Scrum** over **8 two-week sprints** at an
average planned velocity of **~34 story points/sprint**. The committed scope
totals **271 story points**, with a further **18 points** deferred to the
product backlog (full Sinhala/Tamil localisation and transactional email).

**Key outcomes**

- Self-service ordering for approved wholesale buyers (shops, bakeries, hotels, restaurants, caterers).
- Size-grade pricing with automatic bulk-quantity discount tiers and order-time price snapshots.
- Atomic stock reservation that prevents overselling under concurrency.
- In-app bank-transfer slip upload with admin verification, plus cash on delivery.
- Kanban-driven order lifecycle, real-time inventory, delivery zone management, and analytics.
- Role-based access control enforced end-to-end via PostgreSQL Row-Level Security (RLS).

---

## 2. Project Overview

### 2.1 Problem Statement
Abeyrathna Farms takes wholesale egg orders through phone calls and text
messages, with prices, stock, and delivery schedules tracked manually. This
causes pricing inconsistencies, missed or double-booked orders, overselling of
stock, and no reliable sales history.

### 2.2 Product Vision
> **For** wholesale food businesses **who** buy eggs in bulk,
> **CoopCart is** an online ordering platform **that** lets approved buyers see
> live wholesale pricing, place orders, and track delivery — **unlike** phone
> and paper ordering, **our product** gives the farm one source of truth for
> pricing, stock, orders, and payments.

### 2.3 Objectives & Success Metrics

| Objective | Success Metric |
|---|---|
| Move ordering online | ≥ 80% of wholesale orders placed via the platform |
| Eliminate overselling | 0 orders confirmed beyond available stock |
| Consistent pricing | 100% of orders use the price tier active at order time |
| Faster order handling | Order capture time reduced from minutes (call) to seconds |
| Reliable records | Complete, queryable history of orders, payments, and stock |

---

## 3. Stakeholders & Personas

### 3.1 Stakeholders

| Stakeholder | Interest |
|---|---|
| Farm owner (Product Owner proxy) | Revenue, pricing control, operational visibility |
| Sales / order staff | Fast order capture, payment verification |
| Inventory staff | Accurate daily production and stock |
| Delivery staff | Clear delivery schedule and assignments |
| Wholesale buyers | Transparent pricing, easy reordering, delivery reliability |

### 3.2 Personas

- **Nimal — Bakery owner (Buyer).** Orders 20–40 trays, 2–3× per week. Wants to see his tier price, reorder fast, and know the delivery day.
- **Farm Admin (Owner).** Approves new businesses, sets prices, verifies payments, monitors stock and sales.
- **Sales Staff.** Processes orders through the Kanban board and verifies bank slips.
- **Inventory Staff.** Records daily egg production and adjusts stock.

---

## 4. Scope

### 4.1 In Scope
- Public marketing/brand site; B2B registration with admin approval.
- Catalogue of brown eggs by **size grade** (Medium 49–55 g, Large 56–62 g, Extra Large 63–70 g), sold by **tray of 30**.
- Size-grade pricing with **bulk tiers** (5–9 / 10–24 / 25–49 / 50+ trays) and a **minimum order of 5 trays**.
- Cart, checkout, delivery zones & variable fees, delivery-day scheduling with a 6 PM cut-off, and pickup.
- Payments: **bank transfer (slip upload + verification)** and **cash on delivery**; admin-editable bank details.
- Order lifecycle with a Kanban board; real-time inventory; delivery management; reporting; in-app notifications.
- Role-based access control (RBAC) for admin and staff roles.

### 4.2 Out of Scope (Confirmed)
- AI alerts, feeding/yield prediction, worker task checklists, chicken health/death tracking, QR systems.
- Online card-payment gateway.
- Full Sinhala/Tamil localisation and transactional email are **deferred** to the product backlog (English-first release).

---

## 5. Agile Delivery Framework

### 5.1 Methodology
**Scrum** with **2-week sprints**. Work is captured as user stories in a
single Product Backlog, estimated in story points, and pulled into Sprint
Backlogs against a measured velocity.

### 5.2 Roles

| Scrum Role | Responsibility |
|---|---|
| Product Owner | Owns the backlog, priorities, and acceptance (liaises with the farm owner) |
| Scrum Master | Facilitates ceremonies, removes impediments, protects the sprint |
| Development Team | Designs, builds, tests, and ships increments |

### 5.3 Ceremonies

| Ceremony | Cadence | Purpose |
|---|---|---|
| Sprint Planning | Start of sprint | Select stories up to velocity, agree sprint goal |
| Daily Stand-up | Daily (15 min) | Sync progress, surface blockers |
| Backlog Refinement | Mid-sprint | Clarify and estimate upcoming stories |
| Sprint Review | End of sprint | Demo the increment to stakeholders |
| Sprint Retrospective | End of sprint | Inspect and adapt the process |

### 5.4 Definition of Ready (DoR)
A story is *ready* when it has: a clear user-story statement, acceptance
criteria, a story-point estimate, no blocking dependencies, and any required
designs/data.

### 5.5 Definition of Done (DoD)
A story is *done* when:
- Acceptance criteria are met and demoed.
- Code is reviewed and merged to `main` via pull request.
- The project builds with **0 type errors** (`npm run build`).
- RLS/authorisation is enforced for any new data access.
- The UI is responsive and keyboard-accessible.
- Relevant documentation is updated.

---

## 6. Estimation Approach (Story Points)

### 6.1 Scale
Estimation uses a **modified Fibonacci** sequence — **1, 2, 3, 5, 8, 13** —
capturing relative size (complexity + effort + uncertainty), not hours.

### 6.2 Technique
**Planning Poker** during refinement. The team estimates relative to two
anchor (reference) stories:

| Reference Story | Points | Why it anchors the scale |
|---|---|---|
| US-5.3 *Cash-on-delivery option* | **2** | Small, well-understood, low risk |
| US-4.1 *Add to cart / quantity stepper* | **3** | A typical, self-contained feature |
| US-4.6 *Atomic order placement + stock reservation* | **13** | Largest single item: concurrency, transactions, multiple side effects |

### 6.3 Velocity
Planned/average velocity: **~34 points per sprint** (8 sprints).
This drives how many stories are committed each sprint (see §9).

---

## 7. Epics Overview

| # | Epic | Stories | Story Points | Priority |
|---|---|---:|---:|---|
| E1 | Brand & Marketing Site | 7 | 29 | Must/Should |
| E2 | Authentication & Account Management | 7 | 32 | Must |
| E3 | Catalogue & Wholesale Pricing | 6 | 31 | Must |
| E4 | Cart & Checkout | 6 | 37 | Must |
| E5 | Payments | 5 | 18 | Must |
| E6 | Order Management & Fulfilment | 4 | 23 | Must |
| E7 | Inventory Management | 4 | 16 | Must/Should |
| E8 | Delivery Management | 3 | 13 | Should/Could |
| E9 | Admin Console & Operations | 4 | 20 | Must/Should |
| E10 | Reporting & Analytics | 4 | 23 | Should/Could |
| E11 | Notifications | 2 | 10 | Should/Could |
| E12 | Platform & Non-Functional | 5 | 37 | Must/Could |
| | **Total** | **57** | **289** | |

> Of the 289 points, **271** were committed across Sprints 1–8 and **18**
> (US-11.2 email, US-12.4 full i18n) were deferred to the backlog.

---

## 8. Product Backlog

> Priority uses **MoSCoW** (Must / Should / Could / Won't-now). SP = Story Points.

### E1 — Brand & Marketing Site (29 SP)

| ID | User Story | MoSCoW | SP | Sprint |
|---|---|---|---:|---|
| US-1.1 | As a visitor, I want an engaging landing page so I understand what CoopCart offers. | Must | 5 | S1 |
| US-1.2 | As a visitor, I want to browse the product range (no prices) so I can decide to register. | Must | 3 | S1 |
| US-1.3 | As a visitor, I want "how it works" and delivery info so I know what to expect. | Should | 3 | S1 |
| US-1.4 | As a visitor, I want responsive navigation and a footer so I can move around on any device. | Must | 2 | S1 |
| US-1.5 | As the business, I want SEO metadata, sitemap, and robots so the site is discoverable. | Should | 3 | S8 |
| US-1.6 | As the team, I want a reusable brand design system (tokens, fonts, UI components) so the product is consistent. | Must | 8 | S1 |
| US-1.7 | As a visitor, I want tasteful motion/polish so the site feels premium. | Could | 5 | S8 |

### E2 — Authentication & Account Management (32 SP)

| ID | User Story | MoSCoW | SP | Sprint |
|---|---|---|---:|---|
| US-2.1 | As a business, I want to register my company so I can request a wholesale account. | Must | 5 | S2 |
| US-2.2 | As a customer, I want to log in/out securely so I can access my portal. | Must | 3 | S2 |
| US-2.3 | As staff, I want a separate admin login so the console is isolated from customers. | Must | 3 | S2 |
| US-2.4 | As the owner, I want role-based access (admin, manager, sales, inventory, delivery, customer) so people only see what they should. | Must | 8 | S2 |
| US-2.5 | As the owner, I want new accounts to be pending until approved so only verified businesses can buy. | Must | 5 | S3 |
| US-2.6 | As the business, I want protected routes so unauthenticated users can't reach private areas. | Must | 5 | S2 |
| US-2.7 | As a customer, I want to view/manage my business profile so my details stay current. | Should | 3 | S3 |

### E3 — Catalogue & Wholesale Pricing (31 SP)

| ID | User Story | MoSCoW | SP | Sprint |
|---|---|---|---:|---|
| US-3.1 | As an approved buyer, I want a catalogue of grades with weights so I can choose products. | Must | 5 | S3 |
| US-3.2 | As the owner, I want pricing by size grade so larger eggs cost more. | Must | 5 | S3 |
| US-3.3 | As a buyer, I want bulk-quantity discount tiers (5–9/10–24/25–49/50+) so larger orders cost less per tray. | Must | 8 | S3 |
| US-3.4 | As the owner, I want prices visible only to approved buyers so wholesale rates stay private. | Must | 3 | S4 |
| US-3.5 | As the owner, I want to update grade prices and tiers anytime so I can react to the market. | Must | 5 | S4 |
| US-3.6 | As the business, I want each order to store a price snapshot so history stays accurate after price changes. | Must | 5 | S4 |

### E4 — Cart & Checkout (37 SP)

| ID | User Story | MoSCoW | SP | Sprint |
|---|---|---|---:|---|
| US-4.1 | As a buyer, I want to add trays to a cart with a quantity stepper so I can build an order. | Must | 3 | S4 |
| US-4.2 | As a buyer, I want the cart to show live tier pricing and enforce the 5-tray minimum so totals are correct. | Must | 5 | S4 |
| US-4.3 | As a buyer, I want to choose delivery or pickup so I get my order how I prefer. | Must | 3 | S4 |
| US-4.4 | As a buyer, I want to select a delivery zone with its variable fee so I see the true cost. | Must | 5 | S4 |
| US-4.5 | As a buyer, I want a date picker honouring delivery days, the 6 PM cut-off, and blackout dates so I pick a valid slot. | Must | 8 | S4 |
| US-4.6 | As a buyer, I want order placement to atomically reserve stock so orders never oversell. | Must | 13 | S5 |

### E5 — Payments (18 SP)

| ID | User Story | MoSCoW | SP | Sprint |
|---|---|---|---:|---|
| US-5.1 | As the owner, I want admin-editable bank details so the correct account always shows. | Must | 3 | S5 |
| US-5.2 | As a buyer, I want to upload my bank transfer slip in-app so I can prove payment. | Must | 5 | S5 |
| US-5.3 | As a buyer, I want cash on delivery so I can pay on receipt. | Must | 2 | S5 |
| US-5.4 | As staff, I want a payment verification queue so I can approve/reject slips. | Must | 5 | S6 |
| US-5.5 | As the business, I want a payment status lifecycle so order state reflects payment. | Must | 3 | S6 |

### E6 — Order Management & Fulfilment (23 SP)

| ID | User Story | MoSCoW | SP | Sprint |
|---|---|---|---:|---|
| US-6.1 | As a buyer, I want an order list, detail view, and progress timeline so I can track orders. | Must | 5 | S5 |
| US-6.2 | As staff, I want a Kanban board of orders by status so I can manage fulfilment. | Must | 8 | S6 |
| US-6.3 | As staff, I want guarded status transitions so orders follow a valid lifecycle. | Must | 5 | S6 |
| US-6.4 | As the business, I want stock fulfilled on delivery and released on cancellation so inventory stays correct. | Must | 5 | S6 |

### E7 — Inventory Management (16 SP)

| ID | User Story | MoSCoW | SP | Sprint |
|---|---|---|---:|---|
| US-7.1 | As the business, I want real-time stock (on-hand vs reserved) so availability is accurate. | Must | 5 | S5 |
| US-7.2 | As inventory staff, I want to record daily production so stock reflects new eggs. | Should | 3 | S6 |
| US-7.3 | As inventory staff, I want stock adjustments with a movement log so changes are auditable. | Should | 5 | S6 |
| US-7.4 | As a buyer, I want out-of-stock items blocked and low-stock flagged so I can't over-order. | Must | 3 | S5 |

### E8 — Delivery Management (13 SP)

| ID | User Story | MoSCoW | SP | Sprint |
|---|---|---|---:|---|
| US-8.1 | As the owner, I want to manage delivery zones (fees, days) so coverage and pricing are controlled. | Should | 5 | S7 |
| US-8.2 | As the owner, I want blackout dates so I can close delivery on holidays. | Should | 3 | S7 |
| US-8.3 | As staff, I want to assign deliveries to delivery staff so routes are owned. | Could | 5 | S7 |

### E9 — Admin Console & Operations (20 SP)

| ID | User Story | MoSCoW | SP | Sprint |
|---|---|---|---:|---|
| US-9.1 | As staff, I want an admin overview with pending-action banners so I know what needs attention. | Must | 5 | S7 |
| US-9.2 | As the owner, I want a customer approval queue so I can verify and approve businesses. | Must | 5 | S3 |
| US-9.3 | As the owner, I want to manage staff and their roles so access stays correct. | Should | 5 | S7 |
| US-9.4 | As the owner, I want app settings (bank details, payment toggles, cut-off, minimum order) so I can configure the business. | Must | 5 | S7 |

### E10 — Reporting & Analytics (23 SP)

| ID | User Story | MoSCoW | SP | Sprint |
|---|---|---|---:|---|
| US-10.1 | As the owner, I want sales KPIs (revenue, AOV, order counts) so I can track performance. | Should | 5 | S7 |
| US-10.2 | As the owner, I want charts (sales over time, by grade) so I can spot trends. | Should | 8 | S8 |
| US-10.3 | As the owner, I want payment and fulfilment breakdowns so I understand operations. | Should | 5 | S8 |
| US-10.4 | As the owner, I want CSV export and date filters so I can analyse offline. | Could | 5 | S8 |

### E11 — Notifications (10 SP)

| ID | User Story | MoSCoW | SP | Sprint |
|---|---|---|---:|---|
| US-11.1 | As a user, I want in-app notifications so I'm informed of order/payment events. | Should | 5 | S8 |
| US-11.2 | As a user, I want email notifications so I'm informed outside the app. | Could | 5 | Backlog |

### E12 — Platform & Non-Functional (37 SP)

| ID | User Story | MoSCoW | SP | Sprint |
|---|---|---|---:|---|
| US-12.1 | As the business, I want the data model secured with Row-Level Security so data access is enforced at the database. | Must | 13 | S2 |
| US-12.2 | As any user, I want a responsive, accessible UI so I can use it on any device. | Must | 5 | S8 |
| US-12.3 | As any user, I want loading, empty, and error states so the app feels reliable. | Should | 3 | S8 |
| US-12.4 | As a user, I want Sinhala/Tamil language options so I can use my language. | Could | 13 | Backlog |
| US-12.5 | As the team, I want deployment and environment configuration so the app runs in each environment. | Must | 3 | S1 |

---

## 9. Release & Sprint Plan

**Cadence:** 2-week sprints · **Planned velocity:** ~34 SP/sprint · **Release:** end of Sprint 8 (MVP), backlog items thereafter.

| Sprint | Sprint Goal | Committed SP | Cumulative SP |
|---|---|---:|---:|
| **S1** | Foundation, brand system, and public site | 24 | 24 |
| **S2** | Secure data model, auth, and RBAC | 37 | 61 |
| **S3** | Account approval, profiles, and catalogue | 31 | 92 |
| **S4** | Pricing, cart, and checkout scheduling | 37 | 129 |
| **S5** | Atomic ordering, stock, and payment capture | 36 | 165 |
| **S6** | Payment verification, Kanban, and inventory ops | 34 | 199 |
| **S7** | Delivery, admin operations, and settings | 33 | 232 |
| **S8** | Reporting, notifications, SEO, and polish | 39 | 271 |
| **Backlog** | Email notifications + full Sinhala/Tamil i18n | 18 | 289 |

### 9.1 Sprint Composition (Stories per Sprint)

- **S1 (24):** US-1.1, US-1.2, US-1.3, US-1.4, US-1.6, US-12.5
- **S2 (37):** US-12.1, US-2.1, US-2.2, US-2.3, US-2.4, US-2.6
- **S3 (31):** US-2.5, US-2.7, US-9.2, US-3.1, US-3.2, US-3.3
- **S4 (37):** US-3.4, US-3.5, US-3.6, US-4.1, US-4.2, US-4.3, US-4.4, US-4.5
- **S5 (36):** US-4.6, US-5.1, US-5.2, US-5.3, US-6.1, US-7.1, US-7.4
- **S6 (34):** US-5.4, US-5.5, US-6.2, US-6.3, US-6.4, US-7.2, US-7.3
- **S7 (33):** US-8.1, US-8.2, US-8.3, US-9.1, US-9.3, US-9.4, US-10.1
- **S8 (39):** US-1.5, US-1.7, US-10.2, US-10.3, US-10.4, US-11.1, US-12.2, US-12.3

### 9.2 Release Burn-up (Cumulative Completed Points)

```
SP  289 ┤                                                  · (incl. backlog)
    271 ┤                                            ●──────
    232 ┤                                     ●──────
    199 ┤                              ●──────
    165 ┤                       ●──────
    129 ┤                ●──────
     92 ┤         ●──────
     61 ┤   ●──────
     24 ┤●──
      0 ┼───┬────┬────┬────┬────┬────┬────┬────┬────────────
        S1   S2   S3   S4   S5   S6   S7   S8   Backlog
```

---

## 10. Detailed User Stories (Samples)

> Representative stories shown with full acceptance criteria. All other stories
> follow the same template during refinement.

### US-4.6 — Atomic order placement & stock reservation · **13 SP** · Must
**As a** buyer, **I want** placing an order to reserve stock atomically **so that** orders can never exceed available inventory.

**Acceptance Criteria**
- Given an approved buyer with a cart ≥ the minimum order, when they place an order, then an order with a human-readable number (e.g. `CC-2026-00042`) is created.
- Each line stores a **price snapshot** (unit price, product name, grade, weight) at order time.
- Inventory rows are locked during placement; if any item lacks stock the whole order is rejected with a clear message (no partial orders).
- On success, reserved stock increases by the ordered quantity and the cart is cleared.
- Concurrent orders for the same item cannot both succeed beyond available stock.

### US-3.3 — Bulk-quantity discount tiers · **8 SP** · Must
**As a** buyer, **I want** quantity discount tiers **so that** larger orders cost less per tray.

**Acceptance Criteria**
- Tiers are defined per product: 5–9, 10–24, 25–49, 50+ trays.
- The per-tray price reflects the highest tier the quantity qualifies for.
- The cart and checkout recalculate the unit price live as quantity changes.
- The 50+ tier may show a "contact for custom quote" affordance.

### US-2.5 — Account approval gate · **5 SP** · Must
**As the** owner, **I want** new accounts to remain pending until approved **so that** only verified businesses can order.

**Acceptance Criteria**
- A new registration is created with status `pending`.
- Pending/rejected/suspended buyers cannot see pricing or place orders.
- The customer portal shows the correct state (under review / approved / suspended).
- An admin can approve, reject, or suspend from the customer queue; approval unlocks pricing and ordering.
- Status changes are enforced at the database (only staff roles may change status).

### US-5.2 — Bank transfer slip upload · **5 SP** · Must
**As a** buyer, **I want** to upload my transfer slip in-app **so that** I can prove payment for verification.

**Acceptance Criteria**
- Buyer can upload an image/PDF (≤ 5 MB) to a private store, scoped to their account.
- Upload moves the payment to `slip_uploaded` and is visible to staff.
- Staff can view the slip via a secure, time-limited link and approve or reject it (with a reason).
- A rejected slip can be re-uploaded.

---

## 11. Technical Architecture

### 11.1 Technology Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack), React 19, TypeScript |
| Styling | Tailwind CSS v4 (CSS-first design tokens) |
| UI/Motion | shadcn-style component library, Framer Motion, lucide-react |
| Backend | Supabase — PostgreSQL, Auth, Storage, Realtime, RLS, Postgres RPC |
| Forms/Validation | React Hook Form + Zod, Server Actions (`useActionState`) |
| Charts | Recharts |
| Hosting | Vercel (app) + Supabase (data) |

### 11.2 Application Surfaces
- **Public site** — landing, product showcase, registration.
- **Customer portal** (`/app`) — catalogue, cart, checkout, orders, payments, profile.
- **Admin console** (`/admin`) — overview, orders (Kanban), payments, products, inventory, customers, delivery, staff, settings, reports.

### 11.3 Data Model (18 tables)
`profiles`, `businesses`, `products`, `product_prices`, `price_tiers`,
`inventory`, `stock_movements`, `delivery_zones`, `blackout_dates`,
`cart_items`, `orders`, `order_items`, `payments`, `bank_accounts`,
`deliveries`, `app_settings`, `notifications`, plus auth/storage schemas.

### 11.4 Key Server Logic (Postgres RPC)
`place_order` (atomic stock reserve + price snapshot + order number),
`set_order_status`, `fulfill_order_stock`, `release_order_stock`,
`upload_payment_slip`, `verify_payment`, `add_production`, `adjust_stock`,
`assign_delivery`.

### 11.5 Security Model
- Authentication via Supabase Auth (email/password); separate customer and staff logins.
- **RBAC** roles: admin, manager, sales, inventory, delivery, customer.
- **Row-Level Security** on every table; role-helper functions (`is_admin`, `is_staff`, `has_role`, `my_business_approved`); guard triggers prevent privilege/status escalation.
- Private storage buckets for payment slips (owner + staff read only).

---

## 12. Non-Functional Requirements

| Category | Requirement |
|---|---|
| Security | RLS on all tables; least-privilege roles; secrets in environment only |
| Performance | Catalogue/cart interactions < 300 ms perceived; atomic order under concurrency |
| Reliability | No overselling; orders, payments, and stock always consistent |
| Usability | Responsive (mobile-first); clear pending/empty/error states |
| Accessibility | Keyboard navigable, skip-to-content, visible focus, reduced-motion support |
| Maintainability | Typed end-to-end; `npm run build` passes with 0 errors; conventional commits |
| Localisation | Currency LKR; English-first, Sinhala/Tamil ready (deferred) |

---

## 13. Risk Register

| ID | Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|---|
| R1 | Overselling under concurrent orders | Medium | High | Atomic `place_order` RPC with row locking (US-4.6) |
| R2 | Wholesale prices leaking to public | Medium | High | Pricing gated by approval at app + RLS (US-3.4) |
| R3 | Manual payment verification errors | Medium | Medium | Slip upload + structured verify/reject flow (US-5.2/5.4) |
| R4 | Client supplies real bank details late | High | Low | Bank details are admin-editable settings, never hard-coded (US-5.1/9.4) |
| R5 | Scope creep (out-of-scope features) | Medium | Medium | Explicit out-of-scope list; MoSCoW prioritisation |
| R6 | Localisation effort underestimated | Medium | Low | English-first; i18n deferred as a sized backlog item (US-12.4) |
| R7 | Framework breaking changes (Next.js 16) | Medium | Medium | Pin versions; follow bundled migration docs |

---

## 14. Glossary

| Term | Meaning |
|---|---|
| Tray | Standard unit of sale = 30 eggs |
| Size grade | Egg class by weight (Medium/Large/Extra Large) |
| Bulk tier | Quantity band that sets the per-tray price |
| Price snapshot | Price stored on an order line at order time |
| RLS | Row-Level Security (database-enforced access control) |
| RPC | Remote Procedure Call (a Postgres function invoked by the app) |
| COD | Cash on Delivery |
| Velocity | Story points a team completes per sprint |
| MoSCoW | Must / Should / Could / Won't prioritisation |

---

## Appendix A — Story Point Reference Scale

| Points | Meaning | Example |
|---:|---|---|
| 1 | Trivial change, no unknowns | A label/config tweak |
| 2 | Small, well-understood | US-5.3 Cash on delivery |
| 3 | Standard self-contained feature | US-4.1 Add to cart |
| 5 | Multi-part feature, some integration | US-5.2 Slip upload |
| 8 | Complex feature, several moving parts | US-3.3 Bulk pricing tiers; US-6.2 Kanban |
| 13 | Large/risky, concurrency or cross-cutting | US-4.6 Atomic ordering; US-12.1 RLS |

---

*End of document — CoopCart Project Documentation v1.0.*
