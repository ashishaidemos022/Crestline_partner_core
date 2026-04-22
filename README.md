# Crestline Core — CSR Workbench

Dark, cinematic CSR Agent Workbench for the fictional **Crestline Insurance** P&C carrier (TX · CO · FL · WA · AZ). Built for the Talkdesk CXA multi-agent demo.

It unifies three Guidewire-style centers around a Customer 360:

| Route | Purpose |
|---|---|
| `/` | Book Overview — portfolio KPIs, LOB mix, footprint, claims pipeline, delinquency watchlist |
| `/customers` | Customer list with lifecycle / delinquency / open-claim filters |
| `/customers/:id` | **Customer 360** — the hub. Identity, auth/OTP strip, billing mini, policies/claims/billing/quotes tabs |
| `/policies` | PolicyCenter — full policy book with renewal radar |
| `/claims` | ClaimCenter — FNOL Kanban + adjuster drawer |
| `/billing` | BillingCenter — AR, autopay coverage, delinquency queue |
| `/quotes` | Quotes — wizard shell, empty-state friendly |
| `/activity` | Auth & Activity — OTP audit trail |

## Running

```bash
npm run dev    # http://localhost:5173 (or 5174 if 5173 is busy)
npm run build
```

## Data source

Lives against the **`fsec_insurance`** Supabase project (`mmcswqvakxkyrmqvwohn`). The anon key is hard-coded in `src/lib/supabase.ts` for demo convenience.

The project has RLS enabled; an `anon_read_*` SELECT policy has already been applied to each of the 10 core tables. If you ever re-provision the database and pages come back empty, re-run this in the Supabase SQL editor:

```sql
DO $$
DECLARE t text;
DECLARE tbls text[] := ARRAY[
  'customers','policies','vehicles','drivers','claims',
  'billing_accounts','payment_methods','payments','quotes','auth_events'
];
BEGIN
  FOREACH t IN ARRAY tbls LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', 'anon_read_'||t, t);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR SELECT TO anon USING (true)', 'anon_read_'||t, t);
  END LOOP;
END$$;
```

## Stack

- React 18 + Vite + TypeScript
- Tailwind v4 (via `@tailwindcss/vite`) — tokens via CSS variables in `src/index.css`
- `@supabase/supabase-js` · `react-router-dom` · `framer-motion` · `recharts` · `lucide-react` · `date-fns`
- Fonts: Bebas Neue · Barlow Condensed · DM Sans · IBM Plex Mono (Google Fonts)

## Demo narrative flows

**A — OTP + past-due callback**
`/` → delinquency watchlist → click past-due customer → Customer 360 left rail amber-pulses, Auth strip shows recent OTP success, Billing tab shows failed payment + "Retry" CTA.

**B — FNOL intake**
`/claims` → new `reported` claim at top of Kanban → drawer opens with adjuster + linked vehicle → jump to linked Customer 360.

**C — Renewal radar**
`/policies` → `≤ 45d` filter → rows highlight in amber — click to drill into the policy card.
