import Link from "next/link";

const ITEMS = [
  { href: "/tools/website-down-checker", title: "Website down checker", body: "Check if a site is down for everyone or just you." },
  { href: "/tools/ssl-checker", title: "SSL checker", body: "Certificate expiry, issuer and browser trust." },
  { href: "/tools/domain-expiry-checker", title: "Domain expiry check", body: "Look up a domain’s expiration date over RDAP." },
  { href: "/is-down", title: "Is a site down?", body: "Live pages for Instagram, Gmail, IRCTC and 150+ more." },
];

/** Homepage band that points search visitors at the free tools and “is it down?” index. */
export function HomeToolsStrip() {
  return (
    <section className="border-b border-rule bg-bg" aria-labelledby="home-tools-title">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="max-w-xl">
          <p className="label-caps text-accent">Free tools</p>
          <h2 id="home-tools-title" className="mt-3 font-display text-3xl font-medium text-ink sm:text-4xl">
            Check a site right now
          </h2>
          <p className="mt-3 text-muted">No account needed. Save daily monitoring for the sites you look after.</p>
        </div>
        <ul className="mt-10 grid gap-px border border-rule bg-rule sm:grid-cols-2 lg:grid-cols-4">
          {ITEMS.map((l) => (
            <li key={l.href} className="bg-bg">
              <Link href={l.href} className="block h-full px-5 py-5 hover:bg-surface">
                <span className="font-display text-base font-medium text-ink">{l.title} →</span>
                <span className="mt-1.5 block text-sm leading-relaxed text-muted">{l.body}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
