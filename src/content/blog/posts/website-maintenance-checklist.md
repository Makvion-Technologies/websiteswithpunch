If you build or look after websites for clients, the build is the easy part. Keeping fifteen or fifty sites healthy for years is harder, and it's the boring things that catch you out: a domain on a client's personal card that expires, a certificate that stopped renewing after a DNS change, a contact form that quietly stopped sending emails three months ago.

Use this checklist when you take on a website maintenance retainer. It's grouped by how often each check needs doing, with the reason for each item and how to automate it where you can.

## Before anything else: the site record

You can't maintain what you can't access. For every client site, keep one record (a shared document or spreadsheet) with:

| Item | Why it matters |
| --- | --- |
| Domain registrar, account owner, expiry date, auto-renew on/off | The number one cause of avoidable total outages |
| DNS provider and who can log in | Needed for every migration, email change and outage fix |
| Hosting provider, plan, renewal date and billing contact | Suspended hosting looks exactly like a crash |
| SSL source (host-managed, Let's Encrypt, paid CA) and expiry | Tells you whether renewal is automatic |
| CMS, theme and major plugins/licences with renewal dates | Expired licences stop updates, including security fixes |
| Backup location, frequency and last *tested* restore | A backup you've never restored is a hope, not a backup |
| Who to contact for what, at the client | Decisions during an outage can't wait for an email thread |

Keep passwords in a password manager, not in this record. Make sure at least two people can get into every account.

## Daily (automate it)

Nobody should do these by hand. Set them up once and let alerts come to you.

- **Uptime:** is the site answering with a success status? {{checks}}
- **SSL certificate days left:** renewal automation breaks quietly. A daily check of the certificate visitors actually receive catches it weeks ahead.
- **Domain expiry date:** registrar emails go to whoever registered the domain, which may be someone who left the client's company years ago.
- **Backups ran:** your backup tool should alert on failure, not just log it.

[Website Health](/uptime-monitoring) puts uptime, SSL days left and domain days left for every client site on one dashboard. It emails you when a site goes down or comes back, and at 30, 7 and 1 days before a certificate or domain expires.

## Weekly

- **Apply updates:** CMS core, plugins, themes and dependencies. Security updates go first. Take a backup before you update, and check the site after.
- **Test the most important form:** submit the contact or enquiry form and confirm the email arrives. Forms fail silently when a mail plugin breaks or the domain's email settings change. A site can be "up" for months while every lead disappears.
- **Skim the error log** for new PHP or application errors, before they turn into an outage.
- **Check the uptime history** for short outages or slow spells you didn't hear about.

## Monthly

- **Performance:** run PageSpeed Insights on the homepage and a key landing page. Google's "good" Core Web Vitals thresholds are LCP (Largest Contentful Paint) of 2.5 seconds or less, INP (Interaction to Next Paint) of 200 ms or less, and CLS (Cumulative Layout Shift) of 0.1 or less, measured at the 75th percentile of real visits.
- **Google Search Console:** check the page indexing report for new errors, the security issues report, and any manual actions.
- **Broken links:** crawl the site for 404s, especially after content changes.
- **Security headers and HTTPS:** check HTTP redirects to HTTPS in one hop and HSTS is set where it should be. [ERR_TOO_MANY_REDIRECTS](/blog/err-too-many-redirects) covers what goes wrong with redirects.
- **User accounts:** remove admin accounts for people who've left, on both your side and the client's.
- **Disk space and database size** on self-managed servers. A full disk takes a site down instantly.

## Quarterly

- **Restore a backup** to a staging site and click through it. This is the only real test of a backup.
- **Email authentication:** check the domain's SPF, DKIM and DMARC records still match the services that send email for it. A new newsletter tool or CRM often gets added without them.
- **Review DNS records** and remove ones for services the client no longer uses. A leftover CNAME pointing at a deleted cloud resource can let someone else take over that subdomain.
- **Check renewal dates** for the next six months: domain, hosting, premium plugins and licences, paid SSL certificates. Confirm the payment method on each will still be valid.
- **Accessibility spot check** on key templates: keyboard navigation, alt text, colour contrast.

## Yearly

- **Renew domains for several years** when the client agrees, especially brand domains.
- **Review the hosting plan** against real traffic and resource use.
- **Check the CMS and PHP/Node versions** against their support schedules, and plan upgrades before end of life.
- **Update the site record** above, and ask the client whether anything changed on their side: new staff, a new email provider, a rebrand.
- **Re-read the maintenance agreement.** Does it still match what you actually do and what they actually need?

## Certificates are about to need more attention

Public SSL certificates issued since 15 March 2026 last at most 200 days. That drops to 100 days in 2027 and 47 days in 2029. Every manually installed certificate in your portfolio will need replacing more and more often. Moving them to automatic renewal now is cheaper than chasing them later. See [47-day SSL certificates: the 2026–2029 timeline](/blog/ssl-certificate-validity-47-days).

## Reporting to clients

A short monthly report turns invisible work into something the client can see and value:

1. Uptime for the month, plus any incidents and what you did.
2. Updates applied and anything postponed (and why).
3. Days left on the SSL certificate and domain, with upcoming renewals.
4. Performance and Search Console highlights.
5. One recommendation for next month.

Keep it to one page. If you need to explain uptime figures, [what 99.9% uptime really means](/blog/uptime-percentage-explained) has the numbers. If you need to justify the retainer, [how to calculate the cost of website downtime](/blog/cost-of-website-downtime) shows how to put a figure on an outage using the client's own revenue.

## Start with the three things that take sites down

If this list feels like a lot, start with the three that cause the most complete, most embarrassing outages: **uptime, SSL expiry and domain expiry**. They're cheap to automate and expensive to miss. The free plan watches one site, and [Pro and Business](/pricing) cover a whole client list. You can also try the [domain expiry checker](/tools/domain-expiry-checker) and the [SSL checker](/tools/ssl-checker) on any client domain without signing up.
