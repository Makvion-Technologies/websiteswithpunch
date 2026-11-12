For years, a public SSL/TLS certificate lasted about a year. That's changing in steps. Since 15 March 2026, the maximum is 200 days. In 2027 it drops to 100, and from March 2029 it's just 47 days.

If certificates on your sites are renewed by hand, this change turns a once-a-year chore into a monthly one. Here's the schedule, where it comes from, what Let's Encrypt is doing, and a checklist to get ready.

## The schedule

The CA/Browser Forum is the group of certificate authorities and browser makers that sets the rules for publicly trusted certificates. In April 2025 it passed [Ballot SC-081v3](https://cabforum.org/2025/04/11/ballot-sc081v3-introduce-schedule-of-reducing-validity-and-data-reuse-periods/), which adds a schedule of shorter maximum lifetimes to its Baseline Requirements. The limits apply by *issue date*:

| Certificate issued | Maximum validity | Domain validation can be reused for |
| --- | --- | --- |
| Before 15 March 2026 | 398 days | 398 days |
| 15 March 2026 – 14 March 2027 | 200 days | 200 days |
| 15 March 2027 – 14 March 2029 | 100 days | 100 days |
| From 15 March 2029 | 47 days | 10 days |

::fig cert-lifetimes

A few details that matter in practice:

- **Existing certificates aren't shortened.** A certificate keeps the validity it was issued with and works until it expires.
- **CAs issue a little under the limit.** The rules count a day as exactly 86,400 seconds, so many CAs issue for a day less (199, 99, 46 days). DigiCert, for example, moved to a 199-day maximum on 24 February 2026, ahead of the deadline.
- **Domain validation gets shorter too.** By 2029, proof that you control a domain can only be reused for 10 days. In practice, renewals need fresh validation almost every time. That works fine for automated setups, but it's painful for anyone doing it by hand.

## Why certificates are getting shorter

Shorter lifetimes limit the damage when something goes wrong. If a private key leaks or a certificate is issued by mistake, a 47-day certificate stops working within weeks even if nobody revokes it. Revocation has never worked reliably across all browsers, so a short life is the safety net. Shorter lifetimes also mean that when the industry needs to change something, every certificate on the internet is replaced within weeks rather than years.

The cost is that renewal has to be automatic. That's the real goal of the change.

## What Let's Encrypt is changing

Let's Encrypt already issued 90-day certificates, well under the old limit, and it's going shorter on its own schedule:

| Date | Change |
| --- | --- |
| 13 May 2026 | The opt-in `tlsserver` profile issues 45-day certificates |
| 10 February 2027 | The default `classic` profile moves to 64-day certificates; authorisation reuse drops from 30 to 10 days |
| 16 February 2028 | The default profile moves to 45-day certificates; authorisation reuse drops to 7 hours |

Let's Encrypt expects the last 90-day certificates to expire on 11 May 2027 (see its [45-day announcement](https://letsencrypt.org/2025/12/02/from-90-to-45.html) for the details). Its advice is to renew at about two-thirds of a certificate's lifetime. It also says to use ACME Renewal Information (ARI), which lets the CA tell your client when to renew.

> **Warning:** Let's Encrypt specifically warns about renewal scripts with hard-coded day counts. Search your cron jobs, wrapper scripts and runbooks for numbers like 60, 80 or 83. A script that renews "60 days after issue" will let a 45-day certificate expire.

## How many renewals a year?

| Certificate lifetime | Renew at about ⅔ of lifetime | Renewals per year |
| --- | --- | --- |
| 398 days (old maximum) | ~265 days | ~1–2 |
| 200 days | ~133 days | ~3 |
| 100 days | ~67 days | ~5–6 |
| 90 days (Let's Encrypt today) | ~60 days | ~6 |
| 64 days | ~43 days | ~8–9 |
| 47 days | ~31 days | ~12 |

Multiply by the number of hostnames you look after. An agency with 40 client sites on manually installed certificates would go from about 40 renewals a year to nearly 500.

## Your readiness checklist

### 1. Find every certificate

List every hostname with its own certificate: main sites, `www`, subdomains, mail servers, admin panels, staging, APIs, and devices such as routers and NAS boxes that use public certificates. Note who issued each one and how it's renewed today. The free [SSL checker](/tools/ssl-checker) shows the issuer and expiry date for any public hostname.

### 2. Sort them by renewal method

- **Fully managed** (Vercel, Netlify, Cloudflare, most site builders and managed WordPress hosts): renewal is automatic. Just confirm DNS still points at the platform.
- **ACME client on your server** (Certbot, acme.sh, Caddy, Traefik): automated, but check the schedule, the reload step and the client version.
- **Manual** (a certificate bought from a CA and pasted into a control panel or device): this is the group that will hurt. Move each one to ACME automation, or to a host that manages certificates for you.

### 3. Fix the automation you already have

- Update ACME clients to a version that supports ARI. Certbot added it in version 4.1.0.
- Remove hard-coded renewal dates. Let the client decide, or renew at two-thirds of the lifetime.
- Make sure a successful renewal reloads the service. Certbot uses deploy hooks for this. See [Let's Encrypt auto-renewal with Certbot](/blog/certbot-auto-renewal).
- Test against staging before each change takes effect. Let's Encrypt moves staging about a month ahead of production.

### 4. Make validation automatic

With a 10-day validation reuse period, anything that needs a person to answer an email or add a DNS record will break. HTTP-01 validation works if port 80 reaches the server. Wildcards need DNS-01, which needs API access to your DNS provider. A new method called DNS-PERSIST-01 is being standardised to allow a DNS record that doesn't change at every renewal.

### 5. Monitor what visitors actually receive

Automation fails quietly: a DNS change, a closed port, a missed reload. Let's Encrypt stopped sending expiry reminder emails in June 2025, so you need your own check. Read the live certificate from outside and alert well before expiry. [SSL certificate monitoring](/ssl-certificate-monitoring) does this for every site on one dashboard, with emails at 30, 7 and 1 days left.

> **Tip:** Short lifetimes change what "days left" means. A 47-day certificate renewed at two-thirds of its life is replaced with about 15 days to go, so 30 days left is normal. Fewer than about 10 days left means renewal has failed and needs attention today.

## What doesn't change

Private certificates from your own internal CA aren't covered by these rules. Neither are certificates for internal networks that browsers don't need to trust publicly. Code-signing and S/MIME email certificates follow different requirements. The change applies to public TLS certificates, the ones that put the padlock on your website.

If a certificate has already lapsed, [SSL certificate expired: how to fix it fast](/blog/ssl-certificate-expired) walks through the recovery.
