# Monitor Worker (fast checks)

A Cloudflare Worker on the **free plan** that checks uptime every minute for paid plans and every
5 minutes for free sites, and tells the app about confirmed outages. SSL and domain expiry stay in
the app's daily Vercel cron.

## How it works

- Cron `* * * * *`. The site list (`/api/monitor/sites`) is cached in D1 and refreshed once an hour
  (and when the app calls `/sync`), so Neon is not woken every minute.
- Sites are split into batches of `CHUNK` (20). Each batch runs in its own invocation via the
  `SELF` service binding, because the free plan allows 50 outgoing requests per invocation.
- A failed check is retried 2 s later. If it still fails, the Worker sends a "down" candidate to
  `/api/monitor/report`. The app checks the site again from Vercel (Singapore) **before** touching
  the database; only a confirmed outage is saved and emailed (existing alert prefs, unsubscribe
  links and daily caps apply). If the app's check passes, the site is left alone for 10 minutes.
- When a site with an open incident passes, the Worker sends "up" and the app sends the recovery
  mail.
- Each batch writes one compact D1 row per minute (a 2-hour ring buffer). At minute 2 of every hour
  the previous hour is summarised (checks, failures, median response time) and sent to
  `/api/monitor/ingest` in one request per batch.

## Heartbeats (cron job monitors)

- Public ping URL: `GET`, `POST` or `HEAD` `/hb/<token>` on this Worker (24-character random token).
  Pings never touch Vercel or Neon. Each ping is at most one D1 read; a ping is **stored** at most
  once per 30 s per heartbeat (once per 5 minutes after 300 stored in a UTC day), so writes stay
  bounded however often a job calls. Per isolate, more than 10 pings in 10 s for one token get 429,
  and unknown tokens are remembered for a minute so guessing doesn't reach D1.
- The app pushes each create, edit, pause or delete (`/hbput`, `/hbdel`), and the Worker re-copies
  the whole list from `/api/monitor/heartbeats` every hour (`/hbsync` forces it).
- Every minute two indexed reads find heartbeats past period + grace (reported as missed) and
  missed ones that pinged again (reported as back) to `/api/monitor/heartbeats/report`, which saves
  the event and emails the owner through the normal alert rules.
- Once an hour the pings stored per heartbeat go to `/api/monitor/heartbeats/ingest` (daily counts,
  90-day history, last ping time).
- The dashboard reads live state with `/hbstatus` (authenticated).
- D1 table `hb` lives in `schema.sql`; re-running the file is safe (`IF NOT EXISTS`).

## Free-plan limits it is built around

| Limit (Workers Free / D1 Free) | Value | How it is respected |
| --- | --- | --- |
| Requests | 100,000 / day | 1 cron run + 1 per batch per minute (+ hourly roll-ups) |
| Outgoing requests per invocation | 50 | batches of 20 sites, redirects and retries counted |
| Worker invocations per request | 32 | at most 31 batches per minute (about 620 sites due) |
| CPU per invocation | 10 ms | network waits don't count; work is split per batch |
| D1 rows written | 100,000 / day | 1 row per batch per minute + state changes + at most 1 stored ping per heartbeat per 30 s (5 min after 300 a day) |
| D1 rows read | 5,000,000 / day | small indexed reads |

Over about 600 sites due in one minute, raise `CHUNK` after moving to Workers Paid ($5/month).

## Endpoints (all `POST`, `Authorization: Bearer $MONITOR_SECRET`, anything else is 404, except pings)

- `/sync` refresh the site list now (the app calls this when a site is added, edited or deleted)
- `/tick` run one cycle now (manual test)
- `/hbput`, `/hbdel`, `/hbstatus`, `/hbsync` heartbeat config and live state (used by the app)

Public (no secret): `GET|POST|HEAD /hb/<token>` heartbeat pings.
- `/run`, `/rollup` internal (used through the `SELF` binding)

## Local test

```bash
npm install
npm run db:init:local
printf 'MONITOR_SECRET=<same as the app>\n' > .dev.vars
npx wrangler dev --test-scheduled --var APP_URL:http://localhost:3000
curl "http://localhost:8787/__scheduled?cron=*+*+*+*+*"
```

The app must run with `NEXT_PUBLIC_FAST_CHECKS=1` and the same `MONITOR_SECRET`.

Deploy steps: see the setup guide (`batch50-setup.md`).
