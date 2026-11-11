import Link from "next/link";

export type RailLink = { href: string; title: string; body?: string };

/** Compact sidebar list of internal links (title + optional one-liner). */
export function RailLinks({ title, links, more }: { title: string; links: RailLink[]; more?: { href: string; label: string } }) {
  const id = `rail-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  return (
    <section aria-labelledby={id}>
      <h2 id={id} className="label-caps text-muted">
        {title}
      </h2>
      <ul className="mt-3 border-t border-rule">
        {links.map((l) => (
          <li key={l.href} className="border-b border-rule">
            <Link href={l.href} className="group block py-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">
              <span className="block text-sm font-medium text-ink group-hover:text-accent">{l.title}</span>
              {l.body && <span className="mt-0.5 block text-xs leading-relaxed text-muted">{l.body}</span>}
            </Link>
          </li>
        ))}
      </ul>
      {more && (
        <Link href={more.href} className="mt-3 inline-block text-sm font-medium text-accent hover:underline hover:underline-offset-4">
          {more.label} →
        </Link>
      )}
    </section>
  );
}
