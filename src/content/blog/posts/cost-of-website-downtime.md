"Downtime costs $5,600 a minute" turns up in a lot of sales decks. It comes from a 2014 Gartner blog post that averaged figures from large enterprises. It tells you very little about a ten-person company's online shop, or about a client's brochure site.

You can work out a far more useful number for your own site in about fifteen minutes. This guide gives you the formula, a worked example and the costs people usually forget.

## What the published numbers actually say

The headline statistics are real, but they describe big organisations:

- **Gartner (2014):** analyst Andrew Lerner put the average cost of IT downtime at $5,600 per minute, based on enterprise data. It's more than a decade old, and it's an average across very large companies.
- **ITIC 2024 Hourly Cost of Downtime Survey:** over 1,000 firms surveyed. More than 90% of mid-size and large enterprises said one hour of downtime costs them over $300,000, and 41% put it at $1 million to over $5 million. Among smaller businesses with 20 to 100 employees, 57% said an hour cost them up to $100,000.

These are useful for one thing: showing that downtime cost grows with how much of the business runs online. For a budget decision, you need your own figure.

## The formula

Downtime cost has four parts. Add up the ones that apply:

```text
Cost of an outage =
    lost revenue
  + lost productivity
  + recovery cost
  + penalties and credits
  (+ harder-to-measure costs: SEO, ad spend, trust)
```

::fig downtime-cost

### 1. Lost revenue

```text
lost revenue = online revenue per hour × outage hours × peak factor × (1 − recovery rate)
```

- **Online revenue per hour:** monthly online revenue ÷ 720 (the hours in a 30-day month). Use revenue that actually passes through the site: orders, bookings, paid sign-ups.
- **Peak factor:** traffic isn't flat. An outage at 8 pm on a weekday may hit two or three times the average hour, and one at 4 am almost nothing. Look at your analytics for the hour the outage happened.
- **Recovery rate:** some customers come back later and buy anyway. For a brand people seek out, that share can be high. For impulse purchases and ad traffic, it's low. If you don't know, use 0 for a cautious estimate.

### 2. Lost productivity

```text
lost productivity = people affected × loaded hourly cost × outage hours × share of work blocked
```

This matters when the site is also a tool your team uses, such as an admin panel, a booking system or a client portal. It also covers the people handling the phone calls and emails that an outage creates.

### 3. Recovery cost

Developer or agency time to diagnose and fix the problem, emergency support fees, and any refunds or vouchers you hand out to say sorry.

### 4. Penalties and credits

If you host or maintain sites for clients under an SLA, a breach may owe them service credits. Some contracts also have penalty clauses.

## A worked example

A small online shop makes $40,000 a month through its website. On a Friday evening an expired SSL certificate takes it offline for 3 hours before anyone notices and fixes it.

| Line | Working | Cost |
| --- | --- | --- |
| Revenue per average hour | $40,000 ÷ 720 | $55.56 |
| Lost revenue | $55.56 × 3 h × 2 (Friday evening peak) × (1 − 0.25 recovered later) | $250 |
| Productivity | 2 staff × $30/h × 3 h × 50% of work blocked | $90 |
| Recovery | 2 h of developer time × $60/h | $120 |
| Wasted ad spend | $15/h in paid clicks sent to a broken page × 3 h | $45 |
| **Total (measurable)** | | **$505** |

$505 isn't dramatic. That's the point. For most small sites, one outage hurts, but the real cost comes from outages that repeat, last longer, or happen at the worst time. The same failure on Black Friday, or left undetected for a whole weekend, costs many times more.

> **Tip:** Run the numbers for a realistic bad case too, such as a 12-hour outage on your busiest day. That's the figure to compare with the cost of preventing it.

## The costs that don't show up on the invoice

### Search visibility

Google's documentation says that when Googlebot gets 5xx server errors, it slows down crawling. URLs that keep returning a server error are eventually dropped from the index. A short outage is fine. A site that's broken for days, or that serves errors on and off for weeks, can lose rankings that take time to recover. If you need to take the site down on purpose, serve a 503 with a `Retry-After` header and keep it short, as explained in [website maintenance without hurting SEO](/blog/website-maintenance-without-hurting-seo).

### Ad spend

Paid campaigns keep spending while the landing page is down, unless something pauses them. Check how much you spend per hour across ad platforms. It's often the easiest cost to put a number on.

### Trust and churn

A customer who meets an error at checkout may not come back, and you'll never see them in any report. For agencies there's a second layer: a client who hears about an outage from *their* customers starts to question what they pay you for.

## How to bring the number down

Outage cost scales with duration, so cutting the time to *notice* a failure is usually the cheapest saving.

1. **Monitor from outside.** Every hour between failure and detection is an hour at full cost. {{checks}} See [how often you should check website uptime](/blog/uptime-check-intervals) to pick an interval that matches what an hour costs you.
2. **Remove the avoidable causes.** Expired certificates and lapsed domains are 100% preventable. Track every expiry date with [SSL certificate monitoring](/ssl-certificate-monitoring) and [domain expiry monitoring](/domain-expiry-monitoring).
3. **Prepare the fix.** Write down who has access to the registrar, DNS, host and CDN. Outages drag on when nobody has the password.
4. **Tell people.** A status page or a pinned message cuts support load during an incident. Templates are in [how to set up a status page](/blog/status-page-guide).

## If you look after client sites

Agencies and freelancers carry a cost that the formula above doesn't show: the client relationship. Here's how to account for it.

- **Count the hours an incident really takes.** It's not just the fix. There's the client call, the explanation email, the follow-up check and often a free extra hour to rebuild trust. Log them for one incident and you'll have a realistic figure.
- **Agree what you're responsible for.** If the client owns the domain at their own registrar and lets it lapse, is that your outage? Write it down before it happens.
- **Turn the formula into a sales tool.** A one-page estimate of what an outage costs *them* makes a maintenance retainer easy to justify, and it's honest because it uses their own revenue numbers.

## A one-line version for your own site

If you want a single number to quote, use this:

```text
hourly downtime cost ≈ (monthly online revenue ÷ 720) × peak factor + team cost per hour + ad spend per hour
```

Write it down next to your uptime target. Together they tell you how much monitoring, redundancy and on-call effort the site deserves. To see what different uptime percentages mean in hours, see [what 99.9% uptime really means](/blog/uptime-percentage-explained).
