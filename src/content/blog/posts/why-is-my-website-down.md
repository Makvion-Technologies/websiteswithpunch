When a site stops loading, it's tempting to restart everything and hope. It's faster to work out which layer failed. A web request passes through DNS, a network connection, a TLS handshake and finally the web server. Each layer fails with its own symptoms, and each needs a different fix.

This guide goes through the ten most common causes, how to recognise each one, and what to do about it.

## Step 1: Is it down for everyone, or just you?

Rule out your own connection first. A broken Wi-Fi, a VPN, a corporate firewall or a stale DNS cache on your laptop all look like an outage from where you sit.

- Run the free [website down checker](/tools/website-down-checker). It requests the site from Website Health's server and shows the status code, response time and final URL.
- Try mobile data instead of your usual network.
- If it loads elsewhere but not for you, flush your DNS cache and try again. The commands are in [DNS propagation explained](/blog/dns-propagation-explained).

If the site is down from everywhere, work through the layers in order.

::fig request-layers

## Step 2: Read the symptom

The browser's error tells you which layer broke. Here's a quick map:

| What you see | Layer | Most likely causes |
| --- | --- | --- |
| `DNS_PROBE_FINISHED_NXDOMAIN`, "server IP address could not be found" | DNS | Domain expired, nameservers changed, record deleted |
| `ERR_CONNECTION_REFUSED` / `ERR_CONNECTION_TIMED_OUT` | Network | Server off, web server stopped, firewall, wrong IP |
| "Your connection is not private", `NET::ERR_CERT_DATE_INVALID` | TLS | SSL certificate expired or doesn't match the hostname |
| `ERR_TOO_MANY_REDIRECTS` | HTTP | Redirect loop between CDN, server and app |
| 500, 502, 503 or 504 page | HTTP | App crash, overload, timeouts, maintenance mode |
| 403 Forbidden | HTTP | Firewall/WAF rule, file permissions, suspended account |
| Blank white page with status 200 | App | PHP fatal error with display off, failed JavaScript bundle |

From a terminal you can test each layer yourself:

```bash
# DNS: does the name resolve, and to what?
dig +short example.com A
dig +short example.com NS

# HTTP: status code, redirects and headers
curl -sIL https://example.com

# TLS: certificate dates and issuer
echo | openssl s_client -connect example.com:443 -servername example.com 2>/dev/null \
  | openssl x509 -noout -dates -issuer
```

On Windows, `nslookup example.com` and `curl.exe -I https://example.com` cover the first two.

## The 10 most common causes and their fixes

### 1. The domain expired

**Symptoms:** DNS errors everywhere, or the domain suddenly shows a registrar's parking page. Email on the domain stops at the same time.

**Fix:** log in to your registrar and renew. Most registries keep an expired domain renewable at the normal price for a grace period, but the registrar may stop it resolving soon after expiry. Check the date with the free [domain expiry checker](/tools/domain-expiry-checker), and read [what happens when a domain expires](/blog/what-happens-when-a-domain-expires) for the full timeline.

### 2. DNS records were changed or deleted

**Symptoms:** NXDOMAIN or a wrong IP, often right after a migration, a new email provider or a "quick" DNS tidy-up.

**Fix:** check which provider is authoritative (`dig NS example.com`), then compare the A, AAAA and CNAME records with your host's instructions. A leftover AAAA record pointing at an old IPv6 address is a classic cause: some visitors and checkers prefer IPv6 and fail while others work.

### 3. The SSL certificate expired

**Symptoms:** a full-page browser warning. With HSTS enabled, visitors can't click past it at all.

**Fix:** renew and reload the web server. Then find out why automatic renewal failed, or it will happen again. The step-by-step fix is in [SSL certificate expired: how to fix it fast](/blog/ssl-certificate-expired).

### 4. The server or web server process is down

**Symptoms:** connection refused or timed out. Nothing answers on ports 80 and 443.

**Fix:** check the hosting dashboard for incidents. On your own server, check the process is running and listening:

```bash
sudo systemctl status nginx    # or apache2, caddy
sudo ss -ltnp | grep -E ':(80|443)\s'
sudo journalctl -u nginx --since "1 hour ago"
```

A full disk is a common hidden cause. `df -h` takes two seconds and saves hours.

### 5. The hosting account was suspended

**Symptoms:** a host-branded "account suspended" page, or a 403 on every URL.

**Fix:** check the billing email address and the host dashboard. A failed card payment, going over resource limits or a malware report are the usual reasons. If the host's notices go to an inbox nobody reads, change it.

### 6. A bad deploy, theme or plugin update

**Symptoms:** a 500 error or a white screen just after an update. WordPress shows "There has been a critical error on this website."

**Fix:** roll back the last change. On WordPress, renaming the plugin's folder over SFTP disables it, and the recovery-mode email names the plugin that failed. Read the PHP or application error log, not just the browser.

### 7. The database is unreachable

**Symptoms:** "Error establishing a database connection", or 500 errors only on pages that query data.

**Fix:** check that the database service is running, the credentials in your config still match, and the connection limit isn't exhausted. A traffic spike can use up the connection pool on small plans.

### 8. A firewall, WAF or CDN is blocking requests

**Symptoms:** 403 pages, captcha challenges for normal visitors, or CDN-branded errors such as Cloudflare's 521 (web server down) and 522 (connection timed out).

**Fix:** check the firewall's event log for the rule that matched. CDN 52x errors usually mean the CDN can't reach your origin. The origin is down, or its firewall blocks the CDN's IP ranges.

### 9. A redirect loop

**Symptoms:** `ERR_TOO_MANY_REDIRECTS`.

**Fix:** usually an HTTP↔HTTPS or www↔non-www disagreement between your CDN, server and app. The full diagnosis is in [ERR_TOO_MANY_REDIRECTS: causes and fixes](/blog/err-too-many-redirects).

### 10. Too much traffic, or an attack

**Symptoms:** slow responses that turn into 502, 503 or 504 errors, often after a campaign, a viral post or a bot crawl.

**Fix:** turn on caching for anonymous pages, put a CDN in front, rate-limit abusive paths such as login and search, and scale up if it's real demand. The specific errors are explained in [502 vs 503 vs 504 errors](/blog/fix-502-503-504-errors).

## When only some visitors see the outage

Partial outages are the hardest to believe, because the site works fine for you. These are the usual reasons:

- **IPv6 vs IPv4.** A broken AAAA record or a server that doesn't listen on IPv6 fails only for visitors whose networks prefer IPv6. Many mobile networks do.
- **DNS caches.** After a DNS change, visitors whose resolvers cached the old answer reach the old server until the TTL expires.
- **One CDN location.** CDNs serve visitors from the nearest edge location. A problem at one location affects one region.
- **Firewall or rate-limit rules** that block a country, an ISP's address range, or anyone who made too many requests.
- **A certificate that doesn't cover every hostname,** so `example.com` works but `www.example.com` shows a warning.

To pin it down, ask an affected visitor for their exact URL, a screenshot of the error and their rough location. Then test that same URL from outside your own network.

## After it's back: stop it happening again

When the site is back, write down what failed and when. Then close the gap that let it happen.

- **Expiry dates** for the domain and certificate belong on a calendar and a monitor, not in someone's head. [SSL certificate monitoring](/ssl-certificate-monitoring) and [domain expiry monitoring](/domain-expiry-monitoring) track both for every site.
- **Outside-in checks** tell you about an outage before a customer does. {{checks}}
- **Contact details** for the registrar, host and DNS provider should reach an inbox someone reads.

> **Note:** If the site loads for you but a monitor says it's down, believe the monitor until you've checked. Your browser may be serving a cached copy, or your network may resolve DNS differently from the rest of the world.
