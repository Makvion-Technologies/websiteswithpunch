<div align="center">

# Websites With Punch

**Website health monitoring — uptime, SSL certificate and domain expiry alerts on one dashboard.**

[websiteswithpunch.com](https://websiteswithpunch.com)

</div>

## About

Websites With Punch watches the sites you care about and tells you before something breaks. Each monitored site gets a daily check for uptime, SSL certificate expiry and domain expiry, with email alerts when a site goes down or is about to lapse. Free tools on the marketing site let anyone run a one-off SSL, domain or “is it down?” check without an account.

## Features

- **Uptime monitoring** — daily HTTPS checks, on-demand recheck, status and response-time history
- **SSL expiry** — certificate days remaining with configurable warn thresholds and email alerts
- **Domain expiry** — root-domain lookup (RDAP / WHOIS) with warn thresholds and alerts
- **Dashboard** — sites list with health status, last check, SSL and domain days left
- **Auth** — email/password signup and login (NextAuth credentials), email verification, password reset
- **Plans** — Free (1 site), Pro (10 sites), Business (50 sites), with optional site packs on paid plans
- **Billing** — [Dodo Payments](https://dodopayments.com) as merchant of record (checkout, portal, webhooks)
- **Email** — transactional mail via Resend (contact form, auth, alerts)
- **Free public tools** — SSL checker, domain expiry checker, website down checker
- **Referral program** — share a link and earn commission on referred paid plans
- **Cron checks** — protected `/api/cron/check` scheduled via Vercel Cron

## Tech stack

| Layer | Stack |
| --- | --- |
| Web app | Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS |
| Database | Prisma + PostgreSQL (e.g. Neon) |
| Auth | NextAuth.js (credentials) |
| Payments | Dodo Payments |
| Email | Resend |
| Hosting / cron | Vercel (app + daily cron) |
| Analytics | Vercel Analytics, Speed Insights |

## Getting started

### Prerequisites

- Node.js 20+
- npm
- A PostgreSQL database (Neon or local)

### Install

```bash
npm install
cp .env.example .env.local
```

Set at least `DATABASE_URL`, `NEXTAUTH_SECRET` and `NEXTAUTH_URL` (see below). Then:

```bash
npm run db:setup   # prisma db push + seed
npm run dev        # http://localhost:3000
```

`db:setup` seeds a local demo user; the seed script prints the login details to the console.

## Environment

Copy `.env.example` to `.env.local`. Variable names and meaning:

| Variable | Meaning |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string (pooled Neon URL with `sslmode=require` works) |
| `NEXTAUTH_SECRET` | Secret used to sign NextAuth sessions |
| `NEXTAUTH_URL` | Public site URL (also used to build password-reset links) |
| `CRON_SECRET` | Bearer secret for `/api/cron/check` |
| `SEED_SECRET` | Optional key for the seed-test-users endpoint (falls back to `NEXTAUTH_SECRET`) |
| `SSL_WARN_DAYS` | Optional SSL expiry warn threshold in days |
| `DOMAIN_WARN_DAYS` | Optional domain expiry warn threshold in days |
| `DODO_PAYMENTS_API_KEY` | Dodo API key (optional locally; billing shows unavailable without it) |
| `DODO_PAYMENTS_WEBHOOK_KEY` | Dodo webhook signing secret |
| `DODO_PAYMENTS_ENVIRONMENT` | `test_mode` or `live_mode` |
| `DODO_PRODUCT_*` | Dodo product IDs for Pro/Business monthly and annual plans |
| `DODO_ADDON_PACK_*` | Dodo add-on IDs for site packs (Pro and Business, monthly and annual) |
| `RESEND_API_KEY` | Resend API key for outbound email |
| `CONTACT_FROM_EMAIL` | From address for contact mail (verified Resend domain) |
| `CONTACT_TO_EMAIL` | Inbox that receives contact form messages |
| `AUTH_FROM_EMAIL` | Optional From address for auth emails (defaults to `CONTACT_FROM_EMAIL`) |
| `ADMIN_EMAILS` | Comma-separated emails with admin access |
| `UNSUBSCRIBE_SECRET` | Secret used to sign alert unsubscribe links |

## Scripts

```bash
npm run dev          # Next.js development server
npm run build        # prisma generate + next build
npm run start        # serve the production build
npm run lint         # ESLint
npm run test         # unit tests (tsx)
npm run db:push      # prisma db push
npm run db:seed      # seed demo data
npm run db:setup     # db push + seed
npm run indexnow     # submit URLs to IndexNow
```

## Project structure

```
src/app/           Next.js App Router (pages, API routes, cron, webhooks)
src/components/    UI, dashboard, marketing, billing, referrals
src/lib/           Checks, alerts, auth, Dodo, email, plans
src/content/       Marketing copy and free-tool content
prisma/            Schema and seed
scripts/           Ops helpers (IndexNow, Dodo catalog / reconcile)
tests/             Unit and DB tests
vercel.json        Region and cron schedule
```

## Deployment

- **App** — deploy to [Vercel](https://vercel.com). Set the environment variables above in the project settings. `vercel.json` schedules `/api/cron/check` once daily (`30 0 * * *`) in the `sin1` region.
- **Database** — point `DATABASE_URL` at your production Postgres (e.g. Neon), then run `prisma db push` (or migrations) against that database.
- **Billing** — configure Dodo products, add-ons and the webhook endpoint (`/api/webhooks/dodo`) in test mode first, then live. See `DODO_SETUP.md` in this repo for the dashboard checklist.
- **Email** — verify your sending domain in Resend and set `RESEND_API_KEY`.

## Contributing

Internal contributions follow the Makvion Technologies guide:

[CONTRIBUTING.md](https://github.com/Makvion-Technologies/.github/blob/main/CONTRIBUTING.md)

## License

© Makvion Technologies LLP. All rights reserved.
