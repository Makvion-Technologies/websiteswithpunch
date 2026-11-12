Every hosting plan, SaaS contract and status page quotes an uptime number. 99.9% sounds almost perfect, and 99% sounds nearly as good. They aren't close: one allows about 43 minutes of downtime a month, the other more than seven hours.

This guide turns uptime percentages into minutes you can plan around. It shows how the figure is measured and what SLAs usually leave out. It ends with how to pick a target that suits your site.

## The downtime table

The maths is one line: **allowed downtime = length of the period × (1 − uptime)**. The table uses a 30-day month (43,200 minutes) and a 365-day year (525,600 minutes). Some providers use an average month of 30.44 days, which shifts the monthly column slightly.

| Uptime | Per day | Per week | Per 30-day month | Per year |
| --- | --- | --- | --- | --- |
| 99% | 14 min 24 s | 1 h 40 min 48 s | 7 h 12 min | 3 days 15 h 36 min |
| 99.5% | 7 min 12 s | 50 min 24 s | 3 h 36 min | 1 day 19 h 48 min |
| 99.9% | 1 min 26 s | 10 min 5 s | 43 min 12 s | 8 h 45 min 36 s |
| 99.95% | 43 s | 5 min 2 s | 21 min 36 s | 4 h 22 min 48 s |
| 99.99% | 8.6 s | 1 min 0.5 s | 4 min 19 s | 52 min 34 s |
| 99.999% | 0.86 s | 6 s | 26 s | 5 min 15 s |

::fig nines

Each extra "nine" cuts the allowed downtime by a factor of ten. That's why the jump from 99.9% to 99.99% costs far more than the jump from 99% to 99.9%. At four nines, a single slow deploy or one host restart can use up the whole month's budget.

## How to calculate your own uptime percentage

Turn it around to measure a period that has already happened:

```text
uptime % = (total minutes − downtime minutes) ÷ total minutes × 100
```

Say a site had three incidents in a 30-day month, lasting 12, 20 and 25 minutes. That's 57 minutes of downtime:

```text
(43,200 − 57) ÷ 43,200 × 100 = 99.868%
```

That month missed a 99.9% target by about 14 minutes. That's useful to know before a client asks.

### Uptime is only as precise as your checks

A monitoring tool can't see every second. It sends a request at a fixed interval and records whether the site answered. The uptime figure on a dashboard is really "the share of checks that passed". So its precision depends on how often you check.

- Checks every minute can spot outages of a few minutes, and the percentage is close to the real experience.
- Checks every 5 minutes can miss a 3-minute outage entirely, or count a 6-minute one as 5 or 10.
- A daily check gives you a coarse trend line. It catches sites that stay broken, but not short blips.

{{checks}} A coarse number reported honestly is more useful than a precise-looking one that hides how it was measured. For more on picking an interval, read [how often you should check website uptime](/blog/uptime-check-intervals).

## What an SLA usually means (and leaves out)

An SLA (service level agreement) is a contract, and its uptime number has fine print. Before you compare two providers' numbers, check these points:

1. **What counts as down.** Some SLAs only count full outages, not slow responses or errors on part of the service. Others count a minute as down only if a share of requests failed.
2. **The measurement window.** Most measure per calendar month. A provider can have a terrible week and still meet a monthly target.
3. **Exclusions.** Scheduled maintenance, problems caused by the customer, and "force majeure" are almost always excluded. A maintenance window announced in advance may not count at all.
4. **Who measures.** Usually the provider, from its own systems. Your visitors may see a different picture.
5. **The remedy.** Breaching an SLA normally earns a service credit on a future bill, not a refund. It rarely covers what the outage cost your business.

> **Tip:** Hosting uptime is not website uptime. Your site can be down while the server is up, after a bad plugin update, an expired certificate or a lapsed domain. Measure the site from outside, the way visitors reach it.

## Your site depends on more than your host

A page only loads if every part of the path works: DNS, hosting, the CDN, the database and any third-party script that blocks rendering. Each layer has its own availability. In the simplest model, assuming failures don't overlap, the total is the product of the parts:

| Component | Availability |
| --- | --- |
| DNS provider | 99.99% |
| Hosting | 99.9% |
| Payment provider (checkout only) | 99.95% |
| **Checkout path overall** | **99.84%** |

99.99% × 99.9% × 99.95% ≈ 99.84%, which is about 69 minutes a month. That's worse than any single provider promised. Each dependency you add to a critical page takes something away from the total.

## Which uptime target is right for you?

There's no universal "good" number. It depends on what an hour of downtime costs you and what you can afford to engineer. As a rough guide:

| Kind of site | Sensible target | Why |
| --- | --- | --- |
| Portfolio, brochure or blog | 99.5%–99.9% | Visitors come back; a short outage costs little. |
| Lead-generation site | 99.9% | Lost form submissions are lost leads, but traffic is modest. |
| Online store | 99.9%–99.95% | Every minute down during peak hours is lost orders. |
| SaaS app or API others build on | 99.95% and up | Your downtime becomes your customers' downtime. |

If you look after client sites, agree a target in writing. Say what's excluded (planned maintenance, problems caused by the client's own changes) and how you'll measure it. For help putting a money figure on an outage, see [how to calculate the cost of website downtime](/blog/cost-of-website-downtime).

## How to actually hit your target

The number on the dashboard improves for two reasons: outages happen less often, or they end sooner. Most small teams get more from the second.

- **Detect faster.** An outage nobody notices for six hours burns six hours of budget. Monitoring from outside, with alerts, is the cheapest uptime improvement there is. [Website uptime monitoring](/uptime-monitoring) shows what Websites With Punch checks.
- **Remove the boring causes.** Expired SSL certificates and lapsed domains cause outages that are completely avoidable. Track their expiry dates as well as uptime.
- **Make deploys reversible.** Most self-inflicted downtime comes from changes. Keep a quick rollback path and deploy when someone is watching.
- **Plan maintenance properly.** Serve a 503 status with a `Retry-After` header during maintenance, and tell people in advance. See [website maintenance without hurting SEO](/blog/website-maintenance-without-hurting-seo).
- **Communicate.** A clear status update doesn't change the percentage, but it changes how customers remember the outage.

If you're unsure whether a site is up right now, the free [website down checker](/tools/website-down-checker) gives you the status code and response time from the Websites With Punch server in a few seconds.
