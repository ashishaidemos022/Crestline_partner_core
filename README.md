# Crestline Core — CSR Workbench

CSR Agent Workbench for the fictional **Crestline Insurance** P&C carrier
(TX · CO · FL · WA · AZ). Built as the carrier side of the Talkdesk CXA
multi-agent demo: Talkdesk's AI handles voice/auth/triage, this app is
what the CSR sees when the call lands.

The app is partner-reusable. Clone, point at your own Supabase + Vercel,
and you have a working CSR demo to show joint customers.

## Routes

| Route | Purpose |
|---|---|
| `/` | Book Overview — portfolio KPIs, LOB mix, footprint, claims pipeline, delinquency watchlist |
| `/customers` | Customer list with state / delinquency / open-claim filters |
| `/customers/:id` | **Customer 360** — the hub. Identity, auth/OTP strip, billing mini, policies/claims/billing/quotes tabs |
| `/policies` | PolicyCenter — full policy book with renewal radar |
| `/claims` | ClaimCenter — FNOL Kanban + adjuster drawer |
| `/billing` | BillingCenter — AR, autopay coverage, delinquency queue |
| `/quotes` | Quotes — wizard shell, empty-state friendly |
| `/activity` | Auth & Activity — OTP audit trail |
| `/login` · `/change-password` | Custom auth (HS256 JWT in HttpOnly cookie, 24h) |
| `/admin/customers/new` · `/admin/customers/:cid/edit` | **Admin role only** — provision and edit demo customers (see [Admin tools](#admin-tools)) |

## Stack

- **Next.js 15** App Router + React 19 + TypeScript
- Tailwind v4 via `@tailwindcss/postcss`; design tokens in `src/app/globals.css`
- `@supabase/supabase-js` (anon client browser-side, service-role client server-only)
- Custom auth: `jose` (JWT) + `bcryptjs`, middleware-protected on every route
- `framer-motion`, `recharts`, `lucide-react`, `date-fns`

## Setup

### 1. Provision Supabase

Create a new Supabase project. Then either:

- **Recommended:** clone [`crestline-insurance-demo`](https://github.com/ashwin-v-rana/crestline-insurance-demo)
  and apply its `database/` migrations + seed via the Supabase Studio SQL Editor, or
- Apply migrations from another source that match the same schema.

The schema covers customers, policies, vehicles, drivers, claims,
billing_accounts, payment_methods, payments, quotes, auth_events, and
agents.

### 2. Configure env vars

Copy `.env.example` to `.env.local` and fill in the four values:

```
NEXT_PUBLIC_SUPABASE_URL          # https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY     # JWT, public, anon role
SUPABASE_SERVICE_ROLE_KEY         # JWT, server-only, bypasses RLS
JWT_SECRET                        # 32-byte base64: openssl rand -base64 32
```

`SUPABASE_SERVICE_ROLE_KEY` must **never** be exposed to the browser — do
not put it behind a `NEXT_PUBLIC_*` prefix.

Use the **same** `JWT_SECRET` locally and in your deploy environment so
sessions issued in one place stay valid in the other.

### 3. Seed at least one agent

This app has its own `agents` table — no Supabase Auth. You need at least
one agent row before you can log in.

```bash
# Seed the canned demo CSRs (alice/bob/carol/dave/erin · all DemoPass123!).
# Run from the crestline-insurance-demo repo.
cd ../crestline-insurance-demo/database
npm run seed:agents

# Or create a real agent from this repo:
npm run admin:create-agent <email> "<full name>" <role> <password>
# role ∈ { csr, supervisor, admin }
# Created agents are forced to change password on first login.
```

### 4. Run locally

```bash
npm install
npm run dev          # http://localhost:3000
```

### 5. Deploy to Vercel

- Framework preset: **Next.js** (not NestJS — easy to misclick).
- Add all four env vars from step 2 to the Vercel project.
- Deploy.

## Admin tools

Logged-in agents with `role = 'admin'` get extra UI:

- `+ Add customer` button on `/customers` → `/admin/customers/new`. Provide
  first/last/email/phone; the server generates a TX mailing address, an
  auto policy, a vehicle, a driver (primary named insured = self), a
  billing account, a payment method, and a first payment.
- **Danger zone** on `/customers/:cid` with:
  - **Edit** — change first/last/email/phone. Name edits auto-sync the
    matching `relationship='self', is_primary_named_insured=true` driver
    row on the customer's policies.
  - **Delete** — type-name-to-confirm hard delete. CASCADE FKs clean up
    all child rows (policies, vehicles, drivers, claims, billing,
    payments, payment methods); `auth_events.customer_id` is `SET NULL`
    so audit history survives.

All admin endpoints (`/api/admin/customers/**`) enforce the admin role
server-side via `src/lib/admin-guard.ts` — the UI gating is just a
nicety.

CLI alternatives (run from this repo) for agent management:

```bash
npm run admin:create-agent <email> "<name>" <role> <password>
npm run admin:set-password <email> <new-password>
```

## Project layout

```
src/
├─ app/                       # Next.js App Router — route handlers are thin
│  ├─ admin/customers/        # Admin-only pages (new, [cid]/edit)
│  ├─ api/                    # auth/* and admin/customers/*
│  ├─ customers/[id]/         # Customer 360
│  └─ <route>/page.tsx        # Wraps the matching view component
├─ views/                     # Page components (BookOverview, Customer360, …)
├─ components/                # Shared UI (layout/, shared/, charts/)
├─ hooks/                     # useCustomer360, useSessionAgent
├─ lib/
│  ├─ auth.ts                 # JWT sign/verify, session cookie helpers
│  ├─ admin-guard.ts          # requireAdmin() for API routes
│  ├─ supabase.ts             # browser anon client
│  ├─ supabase-server.ts      # server-only service-role client
│  ├─ synthetic-customer.ts   # generator for admin customer-create
│  └─ types.ts, format.ts, …
└─ middleware.ts              # Cookie check + redirect to /login on every route
scripts/
├─ admin-create-agent.ts      # npm run admin:create-agent
└─ admin-set-password.ts      # npm run admin:set-password
```

Path alias: `@/*` → `src/*`. Folder named `views/` (not `pages/`) to
avoid colliding with the legacy Next Pages Router.

## Demo narrative flows

**A — OTP + past-due callback.** `/` → delinquency watchlist → click
past-due customer → Customer 360 left rail amber-pulses, Auth strip
shows recent OTP success, Billing tab shows failed payment + Retry CTA.

**B — FNOL intake.** `/claims` → new `reported` claim at top of Kanban
→ drawer opens with adjuster + linked vehicle → jump to linked Customer
360.

**C — Renewal radar.** `/policies` → `≤ 45d` filter → rows highlight in
amber — click to drill into the policy card.
