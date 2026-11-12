A domain doesn't vanish the moment it expires. It moves through a series of stages over about two and a half months. Each stage has different rules, different costs and a different chance of getting the name back. Knowing where you are on that timeline is the difference between a routine renewal and losing the domain to someone else.

This guide follows a typical generic top-level domain (gTLD) such as .com, .net or .org. The rules come from ICANN policies that registrars and registries must follow. Country-code domains (.uk, .in, .de and others) set their own rules, covered at the end.

## The timeline at a glance

::fig domain-lifecycle

| Stage | Roughly when | Website and email | Can you get it back? | Cost |
| --- | --- | --- | --- | --- |
| Before expiry | Up to the expiry date | Working | Renew any time | Normal renewal price |
| Expired, renewal grace | Day 0 to about day 30–45 | Usually stops resolving, or shows a parked page | Yes, by renewing | Normal price, sometimes a late fee |
| Redemption grace period | 30 days after the registrar deletes it | Down | Yes, through the same registrar | Renewal plus a restore fee, often much higher |
| Pending delete | 5 days | Down | No | Nothing can be done |
| Released | After pending delete | Down | Only by registering it again, if nobody else does first | Open to anyone |

## Before expiry: the reminders

ICANN's [Expired Registration Recovery Policy](https://www.icann.org/en/contracted-parties/consensus-policies/expired-registration-recovery-policy/expired-registration-recovery-policy-21-02-2024-en) (ERRP) requires registrars to send at least two reminders before a gTLD expires: one about a month before and one about a week before. If the domain isn't renewed within five days after expiry, they must send one more notice.

These reminders go to the registrant email on file. If that's an old employee's address, a freelancer who left years ago, or an address *on the expiring domain itself*, nobody will read them. That last one is more common than you'd think, and it fails completely: once the domain stops resolving, mail to it stops too.

## Day 0: the domain expires

On the expiry date the registration lapses, but the registry usually keeps the name in place for a while. For many gTLDs, including .com, the registry gives the registrar an **auto-renew grace period of up to 45 days**. How much of that window you get, and at what price, depends on your registrar's own policy. Read their renewal terms, because they vary a lot.

What you'll notice:

- **The website goes down or shows a parking page.** ERRP requires the registrar to interrupt the domain's normal DNS for at least the last eight days it's still renewable, and many do it from day one. If the registrar shows a page instead, it must say the domain has expired and explain how to renew.
- **Email stops.** MX records stop resolving with everything else, so incoming mail bounces. Password resets, invoices and customer enquiries sent to the domain are lost.
- **Anything else on the domain breaks:** APIs, subdomains, verification records, SSO.

**What to do:** renew straight away at your registrar. DNS normally comes back within minutes to a few hours, depending on caching. If it's slow, see [DNS propagation explained](/blog/dns-propagation-explained).

## Redemption grace period: 30 days, at a premium

If the domain isn't renewed, the registrar deletes it. ERRP requires gTLD registries (except sponsored ones) to offer a **Redemption Grace Period of 30 days** after deletion. During it:

- the domain doesn't resolve at all, and the registry's lookup shows the redemption status;
- it can't be transferred to another registrar;
- only the registrar that deleted it can restore it, at the registrant's request.

Restoring costs the renewal plus a redemption fee. Registrars must publish these fees, and they're often many times the normal renewal price. It's still almost always cheaper than losing the name.

## Pending delete: 5 days, no way back

If nobody restores the domain, it moves to **pending delete** for five days. Nothing can be changed in this state, not even by the registrar. At the end the registry deletes the name and it becomes available to register again.

## After release: the drop

Valuable expired domains rarely stay free for long. Drop-catching services register names the moment they're released, and some names are auctioned by registrars before deletion. A domain with years of backlinks and search history is worth a lot to someone else. Some buyers reuse expired business domains to catch leftover traffic or email meant for the old owner.

> **Warning:** If a domain you've used for email is registered by someone else, they can receive mail sent to it. That includes password-reset emails for any account still tied to an old address on that domain. Update those accounts before you let any domain go on purpose.

## Country-code domains work differently

ICANN's policies cover gTLDs. Country-code domains (ccTLDs) such as .uk, .in, .de, .au or .io are run under their own national rules. Grace periods, suspension dates, restore fees and even whether a redemption period exists all vary. Check the registry's own policy for each ccTLD you look after, rather than assuming the .com timeline applies.

## How to make sure your domain never expires

1. **Turn on auto-renew,** and check the card on file won't expire before the renewal date. Auto-renew failing because of an expired card is one of the most common causes.
2. **Use a contact email that doesn't depend on the domain.** Use a separate address that a person reads, and keep it up to date with the registrar.
3. **Renew for several years** for domains that matter. Most registrars allow up to ten years ahead.
4. **Keep all domains in as few registrar accounts as possible,** with two people who can log in. Agencies often find client domains spread across a dozen accounts nobody remembers.
5. **Lock the domain** (registrar lock / transfer lock) so it can't be moved without your approval.
6. **Track expiry dates yourself.** Registrar emails go to one inbox. An independent check catches what that inbox misses. Look up any domain's date with the free [domain expiry checker](/tools/domain-expiry-checker), which reads it live from the registry over RDAP. Or track every client domain on one dashboard with [domain expiry monitoring](/domain-expiry-monitoring), which emails you at 30, 7 and 1 days before expiry.

## What to do right now if your domain has expired

- **Find the stage.** Check the domain's status in an RDAP or WHOIS lookup. Statuses such as `redemptionPeriod` or `pendingDelete` tell you exactly where you are.
- **Expired but not deleted:** renew at your registrar today.
- **In redemption:** contact the same registrar and ask for a restore. Ask for the fee in writing first.
- **Pending delete or released:** you can't restore it. Watch for the release and try to register it again, or approach whoever registered it.
- **Afterwards:** check that DNS, email, SSL certificates and any verification records all work again. An expired domain often takes the SSL certificate down with it, because renewal validation fails while DNS is interrupted. See [SSL certificate expired: how to fix it fast](/blog/ssl-certificate-expired).
