<div align="center">

# PBL Markets

**A production-grade prediction market platform built for De Anza College's Phi Beta Lambda chapter.**

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=flat-square&logo=supabase&logoColor=white)](https://supabase.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Vercel](https://img.shields.io/badge/Deployed-Vercel-black?style=flat-square&logo=vercel)](https://vercel.com)

*Members trade virtual PBL points on real chapter outcomes. Probabilities shift in real time as bets flow in. Markets resolve with automatic parimutuel payouts.*

---

<!-- Screenshots -->
<!-- Add screenshots here after deployment -->

</div>

---

## Overview

PBL Markets is a full-stack prediction market platform inspired by [Kalshi](https://kalshi.com), purpose-built for the 80+ member De Anza Phi Beta Lambda chapter. It surfaces collective intelligence about chapter outcomes — competitions, events, growth targets, and operations — through market-based probability aggregation.

Members receive 1,000 starting points and trade on markets like *"Will De Anza PBL place Top 3 at NLC Las Vegas?"* or *"Will the April 21 Shark Tank event draw 20+ new member signups?"* Each trade shifts the probability and records a price point, building a full probability history that populates the live charts.

The platform doubles as a chapter engagement tool: the leaderboard creates competitive motivation, the trading mechanics teach prediction market intuition, and market resolution events generate natural discussion around chapter outcomes.

---

## Features

**Markets**
- Parimutuel binary markets with automatic probability calculation
- Hero market with featured chart on the browse page
- Category filtering (Competition, Events, Growth, Operations)
- Market detail page with full-width probability history chart + 1D / 1W / ALL time filtering
- Outcomes table with payout multipliers and probability bars
- Trade history per market with member avatars and roles

**Trading**
- YES / NO position selection with probability display
- Preset amounts (10, 25, 50, 100 pts) + custom input
- Real-time payout preview before placing
- Inline betting on the hero market — no page navigation required
- Full transaction log per user

**Social**
- Live leaderboard with podium display for top 3 traders
- Trending sidebar ranked by volume with probability change indicators
- Closing soon section for time-sensitive markets
- Portfolio tracker with unrealized P&L per position
- Profile page with display name, role, stats, and recent activity

**Admin**
- Create markets with seeded opening pools to set initial probability
- Resolve markets YES or NO — payouts distribute automatically to all winners
- Member management with admin promotion and manual balance adjustment
- Full member roster pre-loaded from re-enrollment form data

**Infrastructure**
- Magic link auth — no passwords, members sign in with email
- Row-level security on all database tables
- Price history recorded on every trade for chart population
- 7-day seed data generated on migration for instant chart coverage
- Loading skeleton states on all data-heavy pages
- Custom 404 page with PBL branding
- OG meta tags on market pages for Discord / social previews

---

## Stack

| Layer | Technology | Purpose |
|---|---|---|
| Framework | Next.js 16 (App Router) | Server components, API routes, file-based routing |
| Language | TypeScript 5 | End-to-end type safety |
| Styling | Tailwind CSS | Custom PBL dark design system |
| Auth | Supabase Auth | Magic link email authentication |
| Database | Supabase (PostgreSQL) | Markets, positions, profiles, price history |
| Security | Supabase RLS | Row-level security on all tables |
| Charts | Recharts | Probability history area charts |
| Deployment | Vercel | Edge-optimized deployment |

---

## Market Mechanics

PBL Markets implements **parimutuel pricing** — the same model used in horse racing and prediction pools:

```
YES payout multiplier = (yes_pool + no_pool) / yes_pool
If YES resolves: payout = multiplier × your_bet
```

Every trade shifts the implied probability:

```
P(YES) = yes_pool / (yes_pool + no_pool)
```

Markets are seeded with equal YES/NO liquidity to set the opening probability. After seeding, all probability movement is driven purely by member trading. Early correct bettors receive higher multipliers than late ones — the platform rewards conviction.

On resolution, the admin selects YES or NO. The system calculates each winner's payout, updates all balances atomically, and logs transactions for the full audit trail.

---

## Database Schema

```sql
profiles          — extends auth.users, stores balance, role, is_admin
markets           — title, category, yes_pool, no_pool, closes_at, resolved, outcome
positions         — user_id, market_id, side, amount (immutable bet records)
transactions      — full ledger: bets (-), payouts (+), admin adjustments
market_price_history — market_id, yes_prob, recorded_at (one row per trade)
```

All tables have Row Level Security enabled. Authenticated users can read all markets, positions, and profiles. Users can only insert their own positions and transactions. Only admins can create or update markets.

---

## Design System

Built from the official Phi Beta Lambda De Anza Brand Identity & Standards Manual (v1.3):

```
#790000  PBL Maroon     — primary brand, Φ logomark, admin accents
#FA4E1D  Orange-red     — YES probability, featured highlights  
#FF983A  Warm orange    — tertiary, closing soon indicators
#0E0B0B  Background     — near-black with warm maroon undertone
#F9F8F6  Cream          — primary text on dark surfaces
```

Typography: **Georgia** (serif) for brand marks and the Φ logomark — **Inter** (sans-serif) for all UI elements. The nav features the official Φ mark in brand maroon, consistent with PBL's logomark usage standards.

---

## Architecture

```
pbl-markets/
├── app/
│   ├── auth/login/              Magic link sign-in page
│   ├── auth/callback/           Supabase auth exchange handler
│   ├── markets/                 Browse page: hero + grid + trending sidebar
│   ├── markets/[id]/            Detail page: chart + outcomes + trade history + bet panel
│   ├── portfolio/               Open positions, P&L, settled history, transactions
│   ├── leaderboard/             Podium + full member rankings
│   ├── profile/                 Display name, stats, recent activity
│   ├── admin/                   Market creation, resolution, member management
│   └── api/
│       ├── bet/                 Place bet: validates, updates pools, records price history
│       ├── admin/markets/       Create market with seed pools
│       ├── admin/resolve/       Resolve market and distribute payouts atomically
│       └── profile/             Update display name
├── components/
│   ├── Nav                      Sticky nav with balance, profile link, admin access
│   ├── HeroMarket               Featured market: two-column with inline betting + live chart
│   ├── MarketCard               Kalshi-style card: probability bars + compact pills
│   ├── MarketDetailChart        Time-filtered price chart (client, 1D/1W/ALL)
│   ├── PriceChart               Recharts AreaChart with custom tooltip and gradient fill
│   ├── BetPanel                 YES/NO selection, preset amounts, payout preview
│   ├── TrendingSidebar          Trending · Closing Soon · Your Positions
│   └── ProfileForm              Client-side display name editing
├── lib/
│   ├── supabase/client.ts       Browser client (createBrowserClient)
│   ├── supabase/server.ts       Server client (createServerClient + cookie handler)
│   └── types.ts                 Interfaces + parimutuel math utilities
└── supabase/
    ├── schema.sql               Full schema: tables, indexes, RLS, auto-profile trigger
    ├── seed.sql                 7 PBL markets + member name UPDATE statements
    └── add_price_history.sql    Price history table + 7-day random walk seed
```

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

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

### 4. Run migrations

In Supabase → SQL Editor, run in order:

1. `supabase/schema.sql` — tables, RLS policies, auto-profile trigger
2. `supabase/add_price_history.sql` — price history table + 7-day seed

### 5. Configure auth

Supabase → Authentication → URL Configuration:
- Site URL: `http://localhost:3000`
- Redirect URLs: `http://localhost:3000/auth/callback`

Authentication → Providers → Email → **Confirm email: OFF**

### 6. Start dev server

```bash
npm run dev
```

Sign in at `localhost:3000`, then make yourself admin:

```sql
UPDATE public.profiles
SET is_admin = true, full_name = 'Your Name', role = 'Your Role'
WHERE email = 'your@email.com';
```

Run `supabase/seed.sql` to create the 7 default markets with seeded price history.

---

## Deployment

```bash
npx vercel
```

Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` as environment variables in the Vercel dashboard. Update Supabase URL Configuration to include your Vercel domain.

---

## Built by

[Arya Somu](https://github.com/arpjw) — Founder & CIO of [Monolith Systematic LLC](https://monolithsystematic.com), VP Strategy & Development at De Anza Phi Beta Lambda, incoming Summer Researcher at Stanford's Advanced Financial Technologies Laboratory.

Built in a single session as a production tool for the 80+ member PBL chapter and as a portfolio project demonstrating applied full-stack systems design.

---

## License

MIT — built for De Anza Phi Beta Lambda, Spring 2026.
