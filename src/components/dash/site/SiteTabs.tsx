import Link from "next/link";

export const SITE_TABS = [
  { id: "analytics", label: "Analytics" },
  { id: "alerts", label: "Alerts" },
  { id: "badge", label: "Badge" },
] as const;
export type SiteTab = (typeof SITE_TABS)[number]["id"];

export const parseTab = (raw: string | undefined): SiteTab => (SITE_TABS.some((t) => t.id === raw) ? (raw as SiteTab) : "analytics");

/** URL-addressable tabs (?tab=…) so a tab can be linked and survives refresh. */
export function SiteTabs({ siteId, active }: { siteId: string; active: SiteTab }) {
  return (
    <nav aria-label="Site sections" className="flex gap-1 overflow-x-auto border-b border-rule">
      {SITE_TABS.map((t) => {
        const on = t.id === active;
        return (
          <Link
            key={t.id}
            href={t.id === "analytics" ? `/dashboard/sites/${siteId}` : `/dashboard/sites/${siteId}?tab=${t.id}`}
            scroll={false}
            aria-current={on ? "page" : undefined}
            className={`-mb-px whitespace-nowrap border-b-2 px-3 py-2.5 text-sm ${on ? "border-accent font-medium text-ink" : "border-transparent text-muted hover:text-ink"}`}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
