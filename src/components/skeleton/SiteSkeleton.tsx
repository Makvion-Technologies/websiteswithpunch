import { Sk, SkStatus } from "./Sk";
import { SiteCardSkeleton } from "./SiteCardSkeleton";
import { AnalyticsSectionSkeleton } from "./AnalyticsSkeleton";

/** Single site: back link, the site card and the full analytics section. */
export function SiteSkeleton() {
  return (
    <div role="status" aria-busy="true">
      <SkStatus label="Loading site…" />
      <div className="mb-4 text-sm">
        <Sk>← Monitors</Sk>
      </div>
      <div className="space-y-5">
        <SiteCardSkeleton analyticsLink={false} />
        <div className="flex gap-1 border-b border-rule text-sm">
          {["Analytics", "Alerts", "Badge"].map((t) => (
            <span key={t} className="px-3 py-2.5">
              <Sk>{t}</Sk>
            </span>
          ))}
        </div>
        <AnalyticsSectionSkeleton />
      </div>
    </div>
  );
}
