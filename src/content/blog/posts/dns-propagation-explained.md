"DNS changes can take up to 48 hours to propagate" is on almost every registrar's help page. It's not wrong, but it hides what's going on. DNS doesn't push changes out across the internet. Your change is live on your DNS provider almost instantly. What takes time is every *cache* that copied the old answer waiting for its copy to expire.

Once you see it that way, you can plan changes that take minutes instead of days, and work out exactly why one person sees the new site while another still sees the old one.

## How a DNS lookup actually works

::fig dns-flow

When someone visits `www.example.com`, their device asks a **recursive resolver**. That's usually their ISP's resolver, their company's, or a public one such as 1.1.1.1 or 8.8.8.8. If the resolver doesn't have the answer cached, it works it out step by step:

1. It asks a **root server** where to find `.com`.
2. It asks the **.com servers** which nameservers are authoritative for `example.com`.
3. It asks those **authoritative nameservers** (your DNS provider) for the `www` record.
4. It returns the answer and **caches it for the record's TTL** (time to live, in seconds), as defined in RFC 1035.

Your browser and operating system keep their own short caches too. Until the TTL runs out, everyone using that resolver gets the cached answer, even if you changed the record a second after it was stored.

## Why "propagation" takes as long as it does

| What you changed | What has to expire | Typical wait |
| --- | --- | --- |
| An A, AAAA or CNAME record | That record's TTL in each resolver | The old TTL: often 5 minutes to 1 hour, sometimes a day |
| A record that didn't exist before | The cached "doesn't exist" answer (negative caching, RFC 2308) | The SOA's negative TTL, often 5 minutes to 1 hour |
| Nameservers (moving to a new DNS provider) | The NS records cached from the TLD's servers | Often up to 48 hours: .com's own NS records carry a 172,800-second (2-day) TTL |
| MX records | The MX TTL at each sending mail server | The old MX TTL |

That's where the 48-hour figure comes from: nameserver changes. Ordinary record changes are limited by the TTL *you* set, and you control that.

## How to make a DNS change fast

Plan the change and the wait almost disappears.

1. **Look up the current TTL** of the record you'll change:

```bash
dig www.example.com A +noall +answer
# www.example.com.  3600  IN  A  203.0.113.10
#                   ^ TTL in seconds
```

2. **Lower the TTL to 300 seconds** (5 minutes) at least one *old* TTL before the change. If it was 3600, lower it at least an hour ahead. If it was 86400, lower it a day ahead.
3. **Make the change** at your DNS provider.
4. **Keep the old server running** until the old TTL has passed. Visitors with the cached address will still arrive there.
5. **Verify** that the authoritative servers already return the new answer (see below).
6. **Raise the TTL again** (to an hour or more) once everything is stable. Long TTLs mean fewer lookups and fewer chances for a resolver hiccup.

> **Tip:** For nameserver moves, copy every record to the new provider *before* you switch nameservers at the registrar. Then both providers give the same answers during the changeover, and nobody notices which one they reached.

### A migration timeline you can copy

Here's the schedule for moving a site to a new server with no visible downtime, assuming the record's TTL is currently one hour:

| When | Action |
| --- | --- |
| A day before | Lower the A/AAAA (or CNAME) TTL to 300 seconds. Copy the site to the new server and test it using a hosts-file override |
| One hour before | Confirm the low TTL is live: `dig` should show 300 or less on public resolvers |
| Switch time | Change the record to the new server. Check the authoritative answer straight away |
| +5 to 15 minutes | Most visitors are on the new server; watch both servers' access logs |
| +1 hour | Traffic to the old server should be close to zero. Issue or check the SSL certificate on the new server |
| A day later | Raise the TTL back to an hour or more, then turn off the old server |

## How to check what the world sees

Ask the authoritative nameservers directly. They show the truth with no cache in between:

```bash
dig NS example.com +short                 # which nameservers are authoritative?
dig @ns1.your-dns-provider.com www.example.com A +short
```

Then ask big public resolvers what they currently have cached:

```bash
dig @1.1.1.1 www.example.com A +short     # Cloudflare
dig @8.8.8.8 www.example.com A +short     # Google
dig @9.9.9.9 www.example.com A +short     # Quad9
```

On Windows, `nslookup www.example.com 8.8.8.8` does the same job. If the authoritative answer is right and a public resolver is wrong, you're waiting on a cache, nothing more. Google Public DNS and Cloudflare's 1.1.1.1 both have public web pages where you can ask them to drop a cached name early.

## Flushing your own caches

If the world sees the new record but your computer doesn't, clear the local caches:

| System | Command |
| --- | --- |
| Windows | `ipconfig /flushdns` |
| macOS | `sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder` |
| Linux (systemd-resolved) | `resolvectl flush-caches` |
| Chrome / Edge | Open `chrome://net-internals/#dns` and click **Clear host cache** |

Your router may cache DNS too. Testing on mobile data is a quick way to get a different resolver.

## DNS mistakes that look like slow propagation

Sometimes it isn't the cache at all. These are the most common mistakes when "propagation" never finishes:

- **Editing the wrong provider.** If the domain's nameservers point to Cloudflare, records changed at the registrar's own DNS do nothing. `dig NS` shows which provider is live.
- **A leftover AAAA record.** You updated the IPv4 address, but an old IPv6 address still points at the previous host. Visitors on IPv6, and some checkers, still reach the old server.
- **A CNAME at the root of the domain.** The DNS standards don't allow a CNAME at the apex (`example.com`) alongside the SOA and NS records there. Use an A record, or your provider's ALIAS, ANAME or "CNAME flattening" feature.
- **Forgetting `www`.** `example.com` and `www.example.com` are separate records. Change both.
- **DNSSEC left pointing at the old provider.** If the registrar still has a DS record for your old DNS provider's keys, resolvers that check DNSSEC return SERVFAIL. For them the domain disappears completely. Remove or update the DS record when you change providers.
- **The domain itself has expired.** No DNS change will help if the registration has lapsed. Check the date with the [domain expiry checker](/tools/domain-expiry-checker), and see [what happens when a domain expires](/blog/what-happens-when-a-domain-expires).

## After a DNS change: what to watch

A DNS change is a small migration, so check the things that depend on it:

- the site loads on both `example.com` and `www`, over HTTPS, without certificate warnings. A new host needs to issue a certificate for your domain, which only works once DNS points at it. The [SSL checker](/tools/ssl-checker) confirms the certificate visitors receive.
- email still arrives (MX, SPF, DKIM and DMARC records copied over);
- verification records for Google Search Console, payment providers and email services are still there.

Ongoing [uptime monitoring](/uptime-monitoring) catches anything the change broke that you didn't spot. It checks the site the same way a visitor would, from outside your network and your caches.
