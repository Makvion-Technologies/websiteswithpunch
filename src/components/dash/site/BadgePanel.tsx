import { CopyLine } from "@/components/heartbeats/parts";
import { Panel } from "@/components/dash/ui";

/** Preview from this origin (CSP img-src is self); the snippets keep the absolute URL. */
const sameOrigin = (url: string) => {
  const u = new URL(url);
  return `${u.pathname}${u.search}`;
};

/** Embed codes for the two public SVG badges (cached 5 minutes). */
export function BadgePanel({ urls, siteUrl }: { urls: { uptime: string; status: string }; siteUrl: string }) {
  const items = [
    { title: "30-day uptime", url: urls.uptime, alt: "Uptime (30 days)" },
    { title: "Current status", url: urls.status, alt: "Status" },
  ];
  return (
    <div className="space-y-6">
      <p className="max-w-2xl text-sm text-muted">
        Show your uptime in a README, a site footer or a client report. Badges refresh every 5 minutes. Each address is a signed key that shows this site&apos;s numbers and nothing else.
      </p>
      {items.map((b) => (
        <Panel key={b.title} title={b.title}>
          <div className="space-y-3 p-4">
            <div className="flex min-h-10 items-center border border-dashed border-rule bg-bg px-3 py-3">
              {/* eslint-disable-next-line @next/next/no-img-element -- live SVG preview of the public badge */}
              <img src={sameOrigin(b.url)} alt={b.alt} height={20} className="h-5 w-auto" />
            </div>
            <div>
              <p className="mb-1 text-xs font-medium text-muted">Markdown</p>
              <CopyLine label={`${b.title} Markdown`} text={`[![${b.alt}](${b.url})](${siteUrl})`} />
            </div>
            <div>
              <p className="mb-1 text-xs font-medium text-muted">HTML</p>
              <CopyLine label={`${b.title} HTML`} text={`<a href="${siteUrl}"><img src="${b.url}" alt="${b.alt}" height="20"></a>`} />
            </div>
          </div>
        </Panel>
      ))}
    </div>
  );
}
