An expired SSL certificate is one of the most visible outages a site can have. Nothing is wrong with the server, the code or the database, yet every visitor gets a full-page warning instead of your site. It's also one of the most preventable.

This guide covers confirming the problem, fixing it on the common setups, why a renewed certificate sometimes *still* shows as expired, and how to stop it happening again.

## What visitors see

Every major browser blocks the page and shows a warning:

| Browser | Warning | Error code |
| --- | --- | --- |
| Chrome, Edge | "Your connection is not private" | `NET::ERR_CERT_DATE_INVALID` |
| Firefox | "Warning: Potential Security Risk Ahead" | `SEC_ERROR_EXPIRED_CERTIFICATE` |
| Safari | "This Connection Is Not Private" | n/a |

If the site sends an HSTS header (`Strict-Transport-Security`), browsers won't offer a "proceed anyway" link at all. The HSTS standard, RFC 6797, says browsers should give users no way around certificate errors on HSTS hosts. API clients, payment webhooks and mobile apps fail outright too. They don't show a warning; requests just stop working.

## Step 1: Confirm it's really the certificate

The same warning appears when the *visitor's* clock is wrong. A laptop whose date has reset to years ago sees every certificate as "not yet valid" or "expired". Check from somewhere neutral before you change anything:

- Run the free [SSL checker](/tools/ssl-checker). It shows the issuer, expiry date, days left, the hostnames covered and whether browsers trust the chain.
- Or check from a terminal:

```bash
echo | openssl s_client -connect example.com:443 -servername example.com 2>/dev/null \
  | openssl x509 -noout -subject -issuer -dates
```

The `notAfter` line is the expiry date (in UTC). Keep the `-servername` flag: servers that host several sites use it (SNI) to pick which certificate to send. Without it you may be looking at the wrong certificate.

Check every hostname people use: `example.com`, `www.example.com` and any subdomains. They often have separate certificates that expire on different dates.

## Step 2: Renew the certificate on your setup

::fig ssl-chain

### Let's Encrypt with Certbot (your own server)

```bash
sudo certbot certificates          # list certificates and their expiry dates
sudo certbot renew                 # renew anything that's due
sudo systemctl reload nginx        # or: apache2
```

If `certbot renew` fails, the error message usually names the problem. Port 80 is blocked, DNS points somewhere else, or the webroot path changed. Fix that first, because the same failure is why the automatic renewal didn't happen. [Let's Encrypt auto-renewal with Certbot](/blog/certbot-auto-renewal) covers each failure in detail.

### cPanel and shared hosting

Most cPanel hosts use AutoSSL. Open **SSL/TLS Status**, select the domains and click **Run AutoSSL**. If it reports a validation failure, the domain's DNS probably doesn't point at this server any more. That's common after moving DNS to a CDN or another host.

### Managed platforms (Vercel, Netlify, Cloudflare, most site builders)

These renew automatically, so an expired certificate means validation broke. Typical reasons:

- the domain's DNS no longer points at the platform (records changed or nameservers moved);
- a CAA DNS record only allows a different certificate authority;
- the domain was removed from the project and added again, or verification is stuck.

Open the platform's domain settings. They normally show the exact verification error.

### A paid certificate from a commercial CA

Buy the renewal, create a new private key and CSR on the server, complete domain validation, then install the new certificate *with its intermediate chain*. Since 15 March 2026, publicly trusted certificates can be valid for at most 200 days. A certificate you used to replace once a year now needs replacing about twice a year. See [47-day SSL certificates](/blog/ssl-certificate-validity-47-days) for the full schedule.

## Renewed, but it still shows as expired

This is the most common follow-up problem. Work through these in order:

1. **The server wasn't reloaded.** Nginx and Apache read certificates when they start. Reload after renewing.
2. **The config points at a different file.** Check the `ssl_certificate` (Nginx) or `SSLCertificateFile` (Apache) path matches the file that was renewed. Certbot's live path is `/etc/letsencrypt/live/<name>/fullchain.pem`.
3. **There's more than one server.** Behind a load balancer, every node, or the balancer itself, needs the new certificate.
4. **A CDN or proxy serves its own certificate.** Visitors see the edge certificate, not your origin's. Renew or re-issue it in the CDN dashboard.
5. **You're checking the wrong hostname.** `www` and the bare domain can be served by different certificates or even different servers.
6. **Your browser cached the error.** Test with `openssl` or an outside checker, not just a browser tab that was open during the outage.

## Chain problems that look like expiry

Sometimes the leaf certificate is fine but the chain isn't. The server may send an old intermediate, or skip the intermediate entirely. Desktop browsers can sometimes fill the gap from their cache, so the site works for you but fails on phones, in `curl` and for API clients. The fix is to serve the full chain: on Certbot setups, `fullchain.pem` rather than `cert.pem`. The [SSL checker](/tools/ssl-checker) flags certificates that browsers won't trust.

## Other certificate errors that look similar

Not every certificate warning is about expiry. If the error code is different, the fix is too:

| Error (Chrome) | Meaning | Fix |
| --- | --- | --- |
| `NET::ERR_CERT_COMMON_NAME_INVALID` | The certificate doesn't cover this hostname | Issue a certificate that includes the name (e.g. add `www`), or redirect to a name it does cover |
| `NET::ERR_CERT_AUTHORITY_INVALID` | Not issued by a trusted CA, or the chain is incomplete | Use a public CA; serve the full chain; replace self-signed certificates |
| `NET::ERR_CERT_REVOKED` | The CA revoked the certificate | Re-issue it, and find out why it was revoked |
| `ERR_SSL_VERSION_OR_CIPHER_MISMATCH` | No protocol or cipher in common, often a missing certificate for this name | Check the server's TLS config and that a certificate is set for this hostname |

The name mismatch is the most common problem after expiry. A certificate covers `example.com` but visitors type `www.example.com`, or a new subdomain is added without updating the certificate. The [SSL checker](/tools/ssl-checker) lists every hostname a certificate covers.

## Why certificates expire even with auto-renewal

Automatic renewal is great until something changes underneath it. The most common causes:

- DNS moved to a new provider or CDN, so the validation request no longer reaches the server that runs the renewal;
- a firewall change closed port 80, which HTTP-01 validation needs;
- the renewal timer or cron job was lost in a server migration or rebuild;
- renewal worked, but nothing reloaded the web server, so it kept serving the old certificate from memory;
- the account email was the only warning system. Let's Encrypt stopped sending expiry reminder emails on 4 June 2025, so many people lost that safety net without noticing.

## How to make sure it doesn't happen again

1. **Automate renewal, and the reload after it.** With Certbot, a deploy hook reloads the web server only after a successful renewal.
2. **Test the automation.** `sudo certbot renew --dry-run` runs the whole process against the staging environment without replacing anything.
3. **Monitor the certificate from outside.** A check that reads the certificate your visitors actually receive catches every cause above, including the ones where renewal "succeeded". [SSL certificate monitoring](/ssl-certificate-monitoring) reads the live certificate daily and emails you at 30, 7 and 1 days before expiry.
4. **Keep an inventory.** List every hostname with its own certificate (mail servers, admin panels, staging) so none is forgotten.

> **Tip:** Certificate lifetimes are getting shorter every year until 2029. A manual process that copes with one renewal a year won't cope with eight. Automating now saves an outage later.
