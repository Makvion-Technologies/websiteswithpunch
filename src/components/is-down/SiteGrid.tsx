import Link from "next/link";
import type { DownSite } from "@/content/is-down";

/** Compact list of “Is X down?” links, used on the index and at the foot of each site page. */
export function SiteGrid({ sites, title }: { sites: DownSite[]; title?: string }) {
  const id = title ? `sites-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}` : undefined;
  return (
    <section aria-labelledby={id}>
      {title && (
        <h2 id={id} className="font-display text-xl font-medium tracking-tight text-ink">
          {title}
        </h2>
      )}
      <ul className={`grid border-l border-t border-rule sm:grid-cols-2 lg:grid-cols-3 ${title ? "mt-5" : ""}`}>
        {sites.map((s) => (
          <li key={s.host} className="border-b border-r border-rule bg-bg">
            <Link href={`/is-down/${s.host}`} className="block px-4 py-3 hover:bg-surface">
              <span className="font-display text-sm font-medium text-ink">Is {s.name} down?</span>
              <span className="mt-0.5 block truncate text-xs text-muted">{s.host}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
