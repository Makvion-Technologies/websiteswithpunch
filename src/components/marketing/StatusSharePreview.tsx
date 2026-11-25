import { OverallBanner } from "@/components/status-page/OverallBanner";
import { StatusRow } from "@/components/status-page/StatusRow";
import { PreviewFrame } from "./PreviewFrame";
import { shareStatusSites, shareStatusUpdatedAt } from "./share-data";

/** Inert replica of a public status page, using the same banner, rows and uptime bars as /status/[slug]. */
export function StatusSharePreview() {
  return (
    <PreviewFrame
      url="websiteswithpunch.com/status/studio-sites"
      label="Preview of a public status page, with an overall banner, per-site status and 90-day uptime bars."
    >
      <div className="bg-bg px-4 py-6 sm:px-6 sm:py-8">
        <header className="mb-6 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="font-display text-2xl font-medium text-ink sm:text-3xl">Studio sites</p>
            <p className="mt-2 text-sm text-muted">Live status for the sites we look after.</p>
          </div>
          <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center border border-rule text-ink">
            <svg viewBox="0 0 24 24" className="hidden h-4 w-4 dark:block" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
            </svg>
            <svg viewBox="0 0 24 24" className="h-4 w-4 dark:hidden" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 14.5A8.5 8.5 0 1 1 9.5 3a7 7 0 0 0 11.5 11.5z" />
            </svg>
          </span>
        </header>
        <OverallBanner overall="partial" updatedAt={shareStatusUpdatedAt} />
        <ul className="mt-6 border border-rule bg-surface">
          {shareStatusSites.map((site) => (
            <StatusRow key={site.id} site={site} />
          ))}
        </ul>
        <p className="mt-3 text-xs text-muted">Uptime is the share of checks that passed each day (UTC). Grey means no checks that day.</p>
        <p className="mt-8 border-t border-rule pt-5 text-center text-xs text-muted">
          Powered by <span className="font-medium text-ink">Websites With Punch</span> · uptime, SSL and domain monitoring
        </p>
      </div>
    </PreviewFrame>
  );
}
