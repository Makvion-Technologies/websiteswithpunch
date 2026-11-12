Certbot is the most common way to run Let's Encrypt on your own server, and it normally renews certificates without anyone touching it. "Normally" is the problem. When renewal breaks, nothing tells you until visitors see a certificate warning. Let's Encrypt itself stopped sending expiry reminder emails on 4 June 2025.

This guide shows how to check that renewal is really set up, how to test it safely, how to reload your web server automatically, and how to fix the most common failures.

## How Certbot renews certificates

Certbot doesn't run all the time. A scheduler runs `certbot renew` regularly. That command looks at every certificate in `/etc/letsencrypt/renewal/` and renews the ones that are due.

::fig renewal-flow

- **Schedule:** most installs add a systemd timer that runs twice a day at a random minute. Snap installs use `snap.certbot.renew.timer`; distribution packages usually use `certbot.timer`. Some older setups use a cron entry instead.
- **When a certificate is "due":** recent Certbot versions renew when roughly a third of the lifetime is left. They also follow ACME Renewal Information (ARI) when the CA provides it, which Certbot supports from version 4.1.0. Older versions renewed at a fixed 30 days before expiry.
- **How it validates:** each certificate remembers the method it was issued with (webroot, the Nginx or Apache plugin, standalone or a DNS plugin) in its renewal config file.

## Step 1: Check the timer exists and runs

```bash
# systemd timers (look for certbot or snap.certbot.renew)
systemctl list-timers | grep -i certbot

# or a cron entry
sudo grep -r certbot /etc/cron* /var/spool/cron 2>/dev/null
```

If neither shows anything, renewal isn't scheduled. That's common after moving to a new server or rebuilding a container. Re-enable the timer:

```bash
sudo systemctl enable --now certbot.timer         # package installs
sudo systemctl enable --now snap.certbot.renew.timer  # snap installs
```

## Step 2: See what Certbot is managing

```bash
sudo certbot certificates
```

This lists each certificate, the domains it covers, its expiry date and its files. Look for two warning signs: a certificate that's already close to expiry, and domains you no longer use. A dead domain whose validation fails can make the renewal run noisy, so delete those with `sudo certbot delete --cert-name old.example.com`.

## Step 3: Test the whole process safely

```bash
sudo certbot renew --dry-run
```

A dry run goes through validation against Let's Encrypt's **staging** environment, without saving anything or touching live certificates. Use it after every server, DNS or firewall change. Testing against production instead can run into Let's Encrypt's rate limits, such as its limit of 5 certificates for the exact same set of names every 7 days.

## Step 4: Reload the web server after renewal

A renewed certificate on disk does nothing until the web server reloads it. Certbot's Nginx and Apache plugins handle this. With webroot or standalone setups, add a **deploy hook**, a script that runs only after a successful renewal:

```bash
sudo tee /etc/letsencrypt/renewal-hooks/deploy/reload-web.sh >/dev/null <<'SH'
#!/bin/sh
nginx -t && systemctl reload nginx
SH
sudo chmod +x /etc/letsencrypt/renewal-hooks/deploy/reload-web.sh
```

The same folder works for other services that use the certificate: a mail server, a database with TLS, or copying files to a load balancer. Scripts in `renewal-hooks/pre/` and `renewal-hooks/post/` run before and after every renewal attempt. Standalone setups use them to stop and start whatever holds port 80.

> **Tip:** `nginx -t &&` in the hook means a broken config never takes the site down during a reload. The reload is simply skipped and the old certificate keeps working until you fix it.

## When renewal fails: the usual causes

Run the dry run and read the error. The full detail is in `/var/log/letsencrypt/letsencrypt.log`.

### "Connection refused" or "Timeout during connect"

HTTP-01 validation needs Let's Encrypt to reach your server on **port 80**, even if the site itself only uses HTTPS. Check the firewall (`sudo ufw status`, security groups on cloud hosts) and that the web server is listening on port 80. Let's Encrypt follows redirects from port 80 to HTTPS, so a normal "redirect everything to HTTPS" rule is fine. Blocking port 80 completely is not.

### "Invalid response" or a 404 for the challenge file

The validation file wasn't served from where Let's Encrypt looked:

- the webroot path changed (new document root, new framework) but the renewal config still has the old `webroot_path`;
- an app router catches `/.well-known/acme-challenge/` and returns its own 404;
- DNS now points at a CDN or a different server than the one running Certbot.

Check the config file in `/etc/letsencrypt/renewal/` and confirm that a test file placed in `<webroot>/.well-known/acme-challenge/` loads over plain HTTP.

### It works over IPv4 but not IPv6

If the domain has an AAAA record, Let's Encrypt tries IPv6 first. An AAAA record left over from an old host, or a server that doesn't listen on IPv6, makes validation fail while the site still works for most people. Fix or remove the AAAA record. [DNS propagation explained](/blog/dns-propagation-explained) covers checking records against each nameserver.

### DNS or CAA problems

A CAA record lists which certificate authorities may issue for your domain. If one exists and doesn't include `letsencrypt.org`, issuance is refused. Check with `dig CAA example.com`.

### Wildcard certificates

Wildcards (`*.example.com`) can only be validated with DNS-01. That needs a DNS plugin with an API token for your DNS provider, such as `certbot-dns-cloudflare`. Keep the credentials file readable only by root (`chmod 600`). Wildcard renewals usually fail because that token expired or lost its permissions.

### Containers and rebuilt servers

In Docker, `/etc/letsencrypt` must be a persistent volume, and something must run `certbot renew` on a schedule. A container that issued a certificate once and then exited won't renew it.

## Commands at a glance

| Task | Command |
| --- | --- |
| List certificates and expiry dates | `sudo certbot certificates` |
| Test renewal without changing anything | `sudo certbot renew --dry-run` |
| Renew everything that's due | `sudo certbot renew` |
| Force one certificate to renew now | `sudo certbot renew --cert-name example.com --force-renewal` |
| Add a name to an existing certificate | `sudo certbot --nginx -d example.com -d www.example.com --expand` |
| Remove a certificate you no longer need | `sudo certbot delete --cert-name old.example.com` |
| Check the renewal schedule | `systemctl list-timers \| grep -i certbot` |
| Read the log | `sudo less /var/log/letsencrypt/letsencrypt.log` |

Use `--force-renewal` sparingly. It ignores the "is it due?" check and counts towards Let's Encrypt's rate limits.

## Get ready for shorter lifetimes

Let's Encrypt's default certificates move from 90 to 64 days on 10 February 2027, and to 45 days in February 2028. Twice-daily `certbot renew` handles that without changes. But scripts that renew on a fixed day count, such as "every 60 days", will let certificates expire. Update Certbot to a version with ARI support and remove any hard-coded dates. The full schedule is in [47-day SSL certificates: the 2026–2029 timeline](/blog/ssl-certificate-validity-47-days).

## Monitor from the outside as well

Everything above runs on the server it's meant to protect. If the server's clock, timer, disk or network breaks, the safety net breaks with it. An outside check reads the certificate visitors actually get, so it catches failed renewals, missed reloads and a CDN serving an old certificate.

- One-off: the free [SSL checker](/tools/ssl-checker) shows the issuer, expiry and days left.
- Ongoing: [SSL certificate monitoring](/ssl-certificate-monitoring) checks every site daily and emails you at 30, 7 and 1 days before expiry. Certbot renews a 90-day certificate when about 30 days are left, so if one ever shows fewer than about 25 days, automatic renewal has failed. Act then, rather than waiting for the 7-day email.

If a certificate has already expired, follow [SSL certificate expired: how to fix it fast](/blog/ssl-certificate-expired).
