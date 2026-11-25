import type { RelatedLink } from "@/components/seo/types";
import { byCadence } from "@/lib/monitor/config";
import { HEARTBEATS } from "@/lib/heartbeats/config";

/** Every public tool and feature page, used for related links, the tools index, nav and sitemap. */
export const TOOL_LINKS: RelatedLink[] = [
  { href: "/tools/ssl-checker", title: "SSL checker", body: "Issuer, expiry date, days left and browser trust for any domain's certificate." },
  { href: "/tools/domain-expiry-checker", title: "Domain expiry checker", body: "Registrar, expiry date and days left, read live from the registry over RDAP." },
  { href: "/tools/website-down-checker", title: "Website down checker", body: "Is it down for everyone or just you? Status code, response time and redirects." },
];

export const FEATURE_LINKS: RelatedLink[] = [
  { href: "/uptime-monitoring", title: "Uptime monitoring", body: byCadence("Uptime checked every minute, with confirmed alerts and 90 days of history.", "A daily check of every site, on-demand rechecks, auto refresh and 90 days of history.") },
  { href: "/ssl-certificate-monitoring", title: "SSL certificate monitoring", body: "Days left on every certificate you look after, amber at 30 days and red at 7." },
  { href: "/domain-expiry-monitoring", title: "Domain expiry monitoring", body: "Renewal dates for your own and your clients' domains on one dashboard." },
  ...(HEARTBEATS
    ? [{ href: "/cron-job-monitoring", title: "Cron job monitoring", body: "Heartbeat URLs for backups and scheduled tasks, with an email when a run is missed." }]
    : []),
  { href: "/website-alerts", title: "Website alerts", body: "Email when a site goes down or a certificate is near expiry, plus Slack, Discord, Telegram or a webhook." },
  { href: "/status-pages", title: "Status pages", body: "A public status page at websiteswithpunch.com/status/your-name, with 90 days of daily uptime." },
  { href: "/weekly-reports", title: "Weekly reports", body: "An opt-in email once a week with uptime, incidents, response time and upcoming renewals." },
  { href: "/expiry-calendar", title: "Expiry calendar", body: "Every SSL and domain renewal on one agenda, plus a private calendar feed." },
  { href: "/uptime-badges", title: "Uptime badges", body: "SVG badges for 30-day uptime and current status, with Markdown and HTML snippets." },
];

/** Related links for a page: the other pages first, never the page itself. */
export function relatedFor(path: string, prefer: "tools" | "features") {
  const first = prefer === "tools" ? TOOL_LINKS : FEATURE_LINKS;
  const second = prefer === "tools" ? FEATURE_LINKS : TOOL_LINKS;
  return [...first, ...second].filter((l) => l.href !== path).slice(0, 4);
}
