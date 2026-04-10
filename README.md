# PBL Markets

A full-stack prediction market platform built for De Anza College's Phi Beta Lambda chapter. Members trade virtual PBL points on chapter outcomes — competitions, events, growth targets, and operations. Probabilities shift in real time as bets flow in, markets are resolved by admins, and payouts distribute automatically.

Built as a showcase project demonstrating systematic thinking applied to community tooling.

---

## Features

| Feature | Details |
|---|---|
| Magic link auth | No passwords — members sign in via email link |
| Parimutuel markets | Probability-weighted pools with automatic payout calculation |
| Live probability charts | Recharts area chart with 1D / 1W / ALL time filtering |
| Hero market | Featured market with inline betting on the homepage |
| Trending sidebar | Volume-ranked markets, closing soon, your positions |
| Portfolio tracker | Open positions, unrealized P&L, settled history |
| Leaderboard | Podium + full member rankings, live balance updates |
| Profile page | Display name editing, stats, recent activity |
| Admin dashboard | Create markets, resolve outcomes, manage members, adjust balances |
| Price history | Every trade records a price point — charts populate automatically |
| Loading skeletons | Pulse skeleton states on all data-heavy pages |
| RLS security | Row-level security on all Supabase tables |

---

## Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 16 (App Router, Server Components) |
| Language | TypeScript |
| Styling | Tailwind CSS with custom PBL design system |
| Auth | Supabase Auth (magic links) |
| Database | Supabase (PostgreSQL) |
| Realtime | Supabase Realtime |
| Charts | Recharts |
| Deployment | Vercel |

---

## Design System

Colors derived from the official Phi Beta Lambda De Anza Brand Identity & Standards Manual (v1.3):

```
#790000  PBL Maroon    — primary brand, logomark
#FA4E1D  Orange-red    — YES probability, accents
#FF983A  Warm orange   — tertiary, warnings
#0E0B0B  Background    — near-black with warm tint
#F9F8F6  Cream         — primary text
```

Typography: Georgia (serif, brand marks) + Inter (sans-serif, UI).

---

## Local Setup

### 1. Clone and install

```bash
git clone https://github.com/arpjw/pbl-markets.git
cd pbl-markets
npm install
```

### 2. Create a Supabase project

Go to [supabase.com](https://supabase.com) → New project. Wait ~60s for provisioning.

### 3. Configure environment

```bash
cp .env.local.example .env.local
```

Fill in your credentials from Supabase → Project Settings → API:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

### 4. Run database migrations

In Supabase → SQL Editor, run these in order:

1. `supabase/schema.sql` — tables, RLS policies, auto-profile trigger
2. `supabase/add_price_history.sql` — price history table + 7-day seed data

### 5. Configure auth

In Supabase → Authentication → URL Configuration:
- Site URL: `http://localhost:3000`
- Redirect URLs: `http://localhost:3000/auth/callback`

Authentication → Providers → Email → **"Confirm email" OFF**

### 6. Start dev server

```bash
npm run dev
```

Navigate to `localhost:3000`, sign in with your email, then make yourself admin:

```sql
UPDATE public.profiles
SET is_admin = true, full_name = 'Your Name', role = 'Your Role'
WHERE email = 'your@email.com';
```

Then run `supabase/seed.sql` in the SQL editor to seed 7 markets.

---

## Architecture

```
pbl-markets/
├── app/
│   ├── auth/           Magic link login + callback handler
│   ├── markets/        Browse markets (homepage) + [id] detail page
│   ├── portfolio/      User positions, P&L, transaction history
│   ├── leaderboard/    Member rankings
│   ├── profile/        Display name + stats
│   ├── admin/          Market creation, resolution, member management
│   └── api/            Server-side API routes (bet, resolve, profile)
├── components/
│   ├── Nav             Sticky top navigation
│   ├── HeroMarket      Featured market with live chart + inline betting
│   ├── MarketCard      Kalshi-style grid card with probability bars
│   ├── MarketDetailChart  Time-filtered price history chart
│   ├── PriceChart      Recharts AreaChart wrapper
│   ├── BetPanel        YES/NO betting UI
│   ├── TrendingSidebar Trending / closing soon / your positions
│   └── ProfileForm     Display name editing
├── lib/
│   ├── supabase/       Browser + server Supabase clients
│   └── types.ts        TypeScript interfaces + parimutuel math helpers
└── supabase/
    ├── schema.sql      Full database schema with RLS
    ├── seed.sql        7 PBL markets + member name update queries
    └── add_price_history.sql  Price history table + 7-day seed
```

---

## Market Mechanics

PBL Markets uses **parimutuel pricing**:

- Each market has a YES pool and a NO pool seeded with equal liquidity
- When you bet X pts on YES: `payout = (total_pool / yes_pool) × X`
- Early correct bettors earn better returns than late ones
- Admins resolve markets; payouts distribute automatically to all winners
- Every trade records a `(market_id, yes_prob, timestamp)` point for charting

---

## Deploying to Production

```bash
npx vercel
```

Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in Vercel dashboard. Update Supabase URL Configuration to include your Vercel domain.

---

## License

MIT — built for De Anza Phi Beta Lambda, Spring 2026.
