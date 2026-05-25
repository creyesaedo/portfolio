# CLAUDE.md

This file provides guidance to Claude Code when working with the portfolio project.

## What this project is

A Next.js 14 portfolio that showcases backend projects. Currently features one project: the ML Market Scraper. The portfolio displays a case study and a live interactive dashboard that calls the NestJS API from that scraper.

**Separate repo** — lives at `C:\Users\Cristian\Desktop\portfolio\`, completely independent from the scraper at `C:\Users\Cristian\Desktop\ml-scraper\`.

## Commands

```bash
# Install dependencies
npm install

# Dev server (http://localhost:3000)
npm run dev

# Production build
npm run build

# Start production server
npm start
```

## Environment variables

```bash
# .env.local — required for the dashboard to work
NEXT_PUBLIC_API_URL=http://localhost:8000   # local dev
# NEXT_PUBLIC_API_URL=https://your-api.onrender.com  # production
```

The dashboard page (`/projects/ml-scraper/dashboard`) calls the NestJS API directly from the browser using `NEXT_PUBLIC_API_URL`. If the API is not reachable, the page shows an informative error instead of crashing.

## Architecture

```
portfolio/
├── app/
│   ├── layout.tsx                              → Root layout + Navbar
│   ├── page.tsx                                → Home: project cards
│   └── projects/
│       └── ml-scraper/
│           ├── page.tsx                        → Case study (static, SSR)
│           └── dashboard/
│               └── page.tsx                    → Dashboard (dynamic, fetches /stats SSR)
├── components/
│   ├── layout/
│   │   └── Navbar.tsx
│   └── ml-scraper/
│       ├── DashboardClient.tsx                 → 'use client' — all interactive state
│       ├── DashboardFilters.tsx                → 'use client' — filter inputs
│       ├── ProductsTable.tsx                   → 'use client' — table + pagination
│       ├── PriceHistoryChart.tsx               → 'use client' — Recharts LineChart
│       └── StatsCards.tsx                      → server component (props only)
├── lib/
│   ├── api.ts                                  → fetch wrappers for all NestJS endpoints
│   └── utils.ts                                → cn(), formatPrice(), formatDate(), formatNumber()
└── .env.local
```

### RSC pattern used

`dashboard/page.tsx` is a **server component** — it fetches `/stats` at request time and passes the result to `DashboardClient` as a prop. The client component handles all filter state, product fetching, and chart rendering. This gives a populated stats section on first load without a client-side loading state.

## NestJS API endpoints consumed

All calls go to `NEXT_PUBLIC_API_URL` (the ml-scraper NestJS app).

| Endpoint | Used by | Notes |
|---|---|---|
| `GET /stats` | dashboard page (SSR) | total_products, total_categories, by_country, snapshot_dates |
| `GET /products` | DashboardClient | Paginated. Params: page, limit, country, category_id, date_from, date_to, search |
| `GET /products/history?ml_public_id=X` | DashboardClient | Price history for a single product — triggers on row click |
| `GET /categories?country=X&parent_only=true` | DashboardFilters | Populates category dropdown when a site is selected |

## Pages

### `/` — Home
Static. Lists projects with description, tech stack badges, and links to case study + dashboard. Add new projects by pushing to the `projects` array in `app/page.tsx`.

### `/projects/ml-scraper` — Case Study
Static SSR. Covers: overview, system architecture, DB design (immutable snapshots, category tree), index strategy (with rationale per index), pagination strategy (offset vs cursor), and resilience patterns. No API calls.

### `/projects/ml-scraper/dashboard` — Interactive Dashboard
Dynamic (`export const dynamic = 'force-dynamic'`). Flow:
1. Server fetches `/stats` → renders stats cards immediately
2. Client fetches `/products` with default filters on mount
3. User changes filters → clicks Apply → re-fetches `/products` page 1
4. User clicks a product row → fetches `/products/history` → renders price chart below the table
5. SQL callout at the bottom shows the active LIMIT/OFFSET and which index covers the query

## Adding a new project to the portfolio

1. Add an entry to the `projects` array in `app/page.tsx`.
2. Create `app/projects/<slug>/page.tsx` for the case study.
3. If it has a dashboard, create `app/projects/<slug>/dashboard/page.tsx` + the corresponding client components under `components/<slug>/`.
4. Add any new API endpoints to `lib/api.ts`.

## Deployment (free tier)

| Service | What | Cost |
|---|---|---|
| **Vercel** | Portfolio (Next.js) | Free — connect GitHub repo, set `NEXT_PUBLIC_API_URL` |
| **Render / Railway / Fly.io** | NestJS API (ml-scraper) | Free tier — set `DATABASE_URL` to Neon pooled URL |
| **Neon** | PostgreSQL | Free tier (512 MB, shared compute) |

The portfolio has no server-side secrets and no database connection — it only fetches from the public NestJS API. Vercel's free tier is sufficient indefinitely.

## Code conventions

- Follow project-wide convention: **everything in English** (identifiers, comments, file names).
- Client components that use browser APIs or stateful hooks → `'use client'` at the top.
- No comments unless the WHY is non-obvious.
- Do not add new dependencies without checking if an existing utility in `lib/utils.ts` or a native browser API covers the need.
