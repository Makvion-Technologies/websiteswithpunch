During an outage, every customer asks the same question: "Is it just me?" They ask by email, on social media, in support chat and on the phone, all at the moment you're busiest. A status page answers it once, in public, for everyone.

This guide covers what a status page should show, where to host it so it survives the outage it's reporting, and how to write incident updates people trust. Copy-ready templates are included.

## What a status page is (and isn't)

A status page is a simple public page, usually at `status.example.com`. It shows whether your service is working right now, what's being done about any problem, and how reliable the service has been lately. It's a communication tool, not a monitoring tool. Monitoring tells *you* something is wrong. The status page tells *your customers* that you know and you're on it.

Not every site needs one. A personal blog doesn't. If people log in to your product, pay through your site, build on your API, or you look after sites for clients, a status page saves support time during every incident.

## What to put on it

| Section | What it shows | Tips |
| --- | --- | --- |
| Overall status | One line: "All systems operational" or the current problem | The first thing people read; keep it plain |
| Components | Website, app, API, checkout, email… each with its own status | Split by what customers *use*, not by your internal architecture |
| Active incidents | Timestamped updates on the current problem | Newest first, times with a timezone |
| Scheduled maintenance | Upcoming planned work with start and end times | Post it days ahead, not minutes |
| Incident history | Past incidents with their updates | Shows you handle problems openly |
| Uptime history | A bar or percentage per component over 30–90 days | Only if it comes from real measurements |
| Subscribe | Email, RSS or chat notifications | People who subscribe stop emailing support |

## Host it somewhere else

A status page that goes down with your site is worse than none. Keep it independent:

- **Different infrastructure.** Don't run it on the same server, hosting account or cloud region as the main site.
- **Independent DNS where you can.** If your DNS provider is the thing that failed, `status.example.com` fails with it. Some teams publish the status page on a separate domain as a fallback, and link to it from social profiles.
- **Static if possible.** A static page on a CDN is very hard to take down and loads fast when everyone refreshes at once.

Options range from hosted status page services to open-source tools you run yourself. Upptime runs on GitHub Actions and GitHub Pages. Uptime Kuma, a self-hosted monitor, includes status pages. Cachet is a self-hosted status page system. Whichever you choose, update it from somewhere that doesn't depend on your main systems: a phone with the admin login saved works.

## Split components the way customers see them

The most common mistake is listing your infrastructure: "web-01", "Postgres primary", "Redis". Customers don't know what those are and can't tell whether a red light affects them. List what they *do* instead:

| Instead of | Show |
| --- | --- |
| Web servers, load balancer | Website |
| API gateway, worker queue | API, Integrations |
| Payment provider, order service | Checkout and payments |
| Mail relay | Email notifications |
| Auth service | Login |

Five to eight components is plenty for most products. Each one should map to something a customer could notice is broken. If one internal failure affects several components, mark each of them. "Login: degraded, Checkout: degraded" is more useful than one vague "partial outage".

## Status pages for agencies and client sites

If you look after websites for clients, you can use the same idea at a smaller scale. Some agencies keep one page listing every client site. Others give each client a private page. Either way, the client sees that you spotted the problem and are fixing it before they have to email you. Keep the wording client-friendly ("Your website was unavailable for 25 minutes this morning because…") and link to it from your monthly report.

## Get it ready before you need it

A status page set up in the middle of an outage is rushed and usually wrong. Do these things on a quiet day:

1. Create the page and its components, and publish one "All systems operational" state.
2. Give at least two people access, and save the login somewhere that works when your main systems don't.
3. Write your four update templates (below) with the components already named, so the first post takes a minute.
4. Link to the status page from your help centre, app footer and social profiles, so people know where to look.
5. Run a pretend incident: post "Investigating", then "Resolved", and check that subscribers get both notifications.

## Incident stages

Most status pages use four stages, and visitors recognise them:

::fig incident-stages

1. **Investigating:** you know something is wrong and you're looking into it.
2. **Identified:** you've found the cause and you're working on a fix.
3. **Monitoring:** a fix is in place and you're watching to make sure it holds.
4. **Resolved:** the incident is over.

You don't have to go through every stage, but you should never jump from "Investigating" straight to silence.

## Templates you can copy

Fill in the brackets, keep times in one timezone, and post the first update as soon as you've confirmed the problem. Don't wait until you understand it.

**Investigating**

```text
[14:05 UTC] We're investigating reports that [the website / checkout / the API]
is [unavailable / loading slowly / returning errors] for some customers.
We'll post another update by [14:35 UTC].
```

**Identified**

```text
[14:22 UTC] We've identified the cause: [a failed database server / an expired
certificate / a problem at our hosting provider]. We're [restoring from the standby /
deploying a fix] and expect service to recover within [30 minutes].
Next update by [14:50 UTC].
```

**Monitoring**

```text
[14:41 UTC] A fix is in place and [the website] is loading normally again.
We're monitoring to make sure it stays stable. If you still see problems,
try refreshing the page. [Orders placed during the incident were / weren't affected.]
```

**Resolved**

```text
[15:30 UTC] This incident is resolved. Between [13:58] and [14:40 UTC],
[about X% of / all] visitors could not [load the site / complete checkout]
because [plain-language cause]. We're [adding monitoring / changing our
renewal process] so this doesn't happen again. We're sorry for the disruption.
```

**Scheduled maintenance**

```text
Scheduled: [Saturday 16 Jan, 02:00–03:00 UTC]. We're [upgrading our database].
[The website will show a maintenance page / Checkout will be unavailable]
during this window. No action is needed from you.
```

## Writing rules that build trust

- **Impact first.** Say what customers can't do before you explain why.
- **Use timestamps with a timezone** on every update. "A few minutes ago" means nothing to someone reading an hour later.
- **Promise the next update and keep the promise,** even if the update is "no change yet, still working on it". Silence is what makes people angry.
- **Use plain language.** "A database server failed" beats "We are experiencing degraded performance in a subset of backend systems."
- **Don't blame a vendor in public mid-incident,** even when it's their fault. Say what's affected and what you're doing. Details can go in the follow-up.
- **Don't guess numbers.** If you don't know how many users were affected, say "some users" until you do.

## After the incident: a short write-up

For anything serious, publish a short post-incident review within a few days. Cover what happened, the timeline, the impact, the root cause, and what you're changing. Keep it blameless, about systems and processes rather than people. Customers rarely leave because of one well-handled outage. They leave when the same outage happens again with no explanation.

## Where monitoring fits in

A status page is only as good as how fast you learn about problems. If customers tell you first, the "Investigating" post is already late. Outside monitoring narrows that gap. [Uptime monitoring](/uptime-monitoring) emails you when a check finds a site down and again when it recovers. {{checks}} Expiry alerts for [SSL certificates](/ssl-certificate-monitoring) and domains warn you weeks before those outages happen, so they never need a status update at all.

Website Health doesn't host public status pages yet. For now, the templates above work with whichever status page tool you choose. To put a number on what an outage costs, see [how to calculate the cost of website downtime](/blog/cost-of-website-downtime). To plan downtime properly, see [website maintenance without hurting SEO](/blog/website-maintenance-without-hurting-seo).
