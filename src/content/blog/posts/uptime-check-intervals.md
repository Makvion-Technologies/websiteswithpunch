Uptime monitors sell on check intervals: every 5 minutes, every minute, every 30 seconds. A shorter interval sounds better, and sometimes it is. But the interval is really a trade-off between how fast you hear about an outage, how many false alarms you get, and what you pay.

This guide works through the maths so you can pick an interval on purpose rather than by price tag.

## What the interval controls: time to detect

A monitor checks your site at fixed points in time. If the site breaks just after a check, nobody knows until the next check comes round. So:

- **Worst-case detection delay** ≈ one full interval (plus any confirmation step).
- **Average detection delay** ≈ half an interval, because outages start at random moments.

| Check interval | Average time to notice | Worst case |
| --- | --- | --- |
| 30 seconds | 15 s | 30 s |
| 1 minute | 30 s | 1 min |
| 5 minutes | 2.5 min | 5 min |
| 15 minutes | 7.5 min | 15 min |
| 1 hour | 30 min | 1 h |
| Once a day | 12 h | 24 h |

::fig check-intervals

Detection is only the first part of an outage. After it come the alert reaching a person, that person reacting, and the fix itself. On a small team, the time between an alert and someone actually starting the fix is often longer than the interval. Moving from 5-minute to 1-minute checks saves two minutes on average. A clear plan for who answers the alert can save twenty.

## Short outages can slip between checks

The interval also decides which outages you see at all. An outage that starts and ends between two checks is invisible to the monitor. Assuming outages start at random times, the chance a check lands inside an outage of length *d* is roughly *d ÷ interval* (capped at 100%):

| Outage length | 1-min checks | 5-min checks | 1-hour checks | Daily checks |
| --- | --- | --- | --- | --- |
| 2 minutes | ~100% | ~40% | ~3% | ~0.1% |
| 10 minutes | 100% | 100% | ~17% | ~0.7% |
| 1 hour | 100% | 100% | 100% | ~4% |
| 6 hours | 100% | 100% | 100% | 25% |
| 1 day or longer | 100% | 100% | 100% | 100% |

This matters in two ways:

1. **Alerting.** If your site flaps (down for two minutes, back, down again), long intervals will mostly miss it. Visitors won't.
2. **Reported uptime.** A monitor's uptime percentage is the share of checks that passed. With long intervals, short outages never make it into the number, so the figure looks better than the real experience. See [what 99.9% uptime really means](/blog/uptime-percentage-explained) for how the percentage is calculated.

## Why faster checks bring false alarms, and how to stop them

A single failed request doesn't prove a site is down. The internet drops packets, a route flaps for a few seconds, a CDN edge node restarts, or the monitor's own network has a bad moment. The more often you check, the more of these one-off failures you'll see. If each one sends an alert, people learn to ignore alerts. That's worse than not having them.

Good monitors filter these out before alerting:

- **Retry before alerting.** Recheck a failure after a few seconds. Most blips are gone by then.
- **Confirm from a second location.** If one region can't reach the site but another can, that's a network problem, not an outage.
- **Use sensible timeouts.** A 2-second timeout on a site that usually answers in 1.5 seconds will fire on every slow moment. Base the timeout on your normal response time with plenty of headroom.
- **Count consecutive failures.** Alert after two or three failed checks in a row, not one.

Each of these adds a little delay, so a "1-minute" monitor with confirmation might take 2–3 minutes to alert. That's a fair trade for alerts you can trust.

## How to choose an interval

Start from what an hour of downtime costs you. [How to calculate the cost of website downtime](/blog/cost-of-website-downtime) walks through it. Then match the interval to the stakes:

| Kind of site | Suggested interval | Reasoning |
| --- | --- | --- |
| Personal site, portfolio, small brochure site | 5 minutes to daily | Outages are costly only if they last; catching them within hours is often enough |
| Business site with lead forms | 1–5 minutes | Lost enquiries add up during working hours |
| Online store, booking system | 1 minute | Every minute in peak hours is lost orders |
| API or SaaS that others depend on | 30 seconds to 1 minute, plus multi-location | Your outage becomes your customers' outage |

> **Tip:** Uptime checks aren't the only thing to monitor. SSL certificates and domains expire on a known date, so a daily check is plenty to catch them weeks ahead. A faster uptime interval doesn't help with those at all.

## What else affects detection

The interval gets the attention, but a few other choices matter as much:

- **What you check.** A homepage check won't notice a broken checkout or a dead API endpoint. Monitor the pages that earn money.
- **What counts as "up".** A page can return 200 and still show an error message, or an empty page from a failed build. Keyword checks (looking for a word that should be on the page) catch those.
- **Where alerts go.** An email to an inbox checked once a day turns a 1-minute check into a 1-day response. Send alerts where someone will see them.

## A worked example: three sites, three intervals

Here's how you might set up monitoring for three different sites, using the reasoning above:

1. **A photographer's portfolio.** Mostly found through search and word of mouth, no online sales. An outage of a few hours costs very little. The real risks are slow ones: the domain lapsing, the certificate expiring, the host closing the account. A daily check plus expiry alerts covers them, and short blips don't matter.
2. **A plumbing company's lead site.** Calls and form submissions during working hours are the business. Five-minute checks with confirmation, alerts by email and phone during the day, and a weekly test of the contact form, because a broken form doesn't show up as "down".
3. **An online shop doing most of its sales in the evening.** One-minute checks on the homepage *and* the checkout, confirmed from a second location, alerts to someone who's on call in the evenings, plus a keyword check that the product page actually shows prices.

The interval follows from the cost, not the other way round. Three sites, three different setups, and each one spends its effort where an outage would actually hurt.

## How Websites With Punch handles this today

Here is exactly what it checks, so you can compare it with the intervals above. {{checks}}

A once-a-day check also reads each site's SSL certificate and domain expiry date, with email alerts at 30, 7 and 1 days before either one expires. That covers the slow failures: a site that broke after an update, a host that quietly went away, a certificate or domain about to lapse. Plans and limits are on the [pricing page](/pricing), and [uptime monitoring](/uptime-monitoring) explains the checks in detail.

If you need an answer right now, the [website down checker](/tools/website-down-checker) runs a one-off check from the Websites With Punch server, no account needed.
