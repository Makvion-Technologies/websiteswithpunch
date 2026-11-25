import { dayBars, type DayBar } from "@/lib/uptime-days";
import { expiryEvents, groupByMonth, type MonthGroup } from "@/lib/expiry/events";
import type { PublicSite } from "@/lib/status-pages/load";
import type { WeeklyReport } from "@/lib/reports/build";
import { CHANNEL_LIMIT, STATUS_PAGE_LIMIT, planWord } from "@/lib/features/limits";

/** Frozen instant so the previews match in SSR and the browser. */
export const SHARE_NOW = Date.parse("2026-11-25T12:00:00Z");

const DAY = 86_400_000;

const sites = [
  { id: "shop", name: "My shop", url: "https://shop.example.com", sslDays: 62, domainDays: 164, status: "up" as const, uptime: 99.9, avgMs: 142, incidents: 0, downMs: 0 },
  { id: "launch", name: "Launch page", url: "https://launch.example.io", sslDays: 45, domainDays: 6, status: "down" as const, uptime: 98.2, avgMs: 210, incidents: 1, downMs: 17 * 60_000 },
  { id: "blog", name: "Client blog", url: "https://blog.example.org", sslDays: 21, domainDays: 300, status: "up" as const, uptime: 100, avgMs: 188, incidents: 0, downMs: 0 },
  { id: "docs", name: "Docs", url: "https://docs.example.dev", sslDays: 88, domainDays: 41, status: "up" as const, uptime: 99.8, avgMs: 98, incidents: 0, downMs: 0 },
];

const host = (url: string) => new URL(url).host;

/** 90 daily bars, mostly up, with a couple of dips so the status page looks live. */
function barsFor(id: string): DayBar[] {
  const dips: Record<string, Record<number, { total: number; up: number }>> = {
    launch: { 46: { total: 40, up: 28 }, 88: { total: 40, up: 0 } },
    shop: { 21: { total: 40, up: 38 } },
  };
  const overlay = dips[id] ?? {};
  const rows = Array.from({ length: 90 }, (_, i) => {
    const r = overlay[i] ?? { total: 40, up: 40 };
    return { siteId: id, day: new Date(SHARE_NOW - (89 - i) * DAY).toISOString().slice(0, 10), ...r };
  });
  return dayBars(rows, 90, SHARE_NOW);
}

export const shareStatusSites: PublicSite[] = sites.map((s) => ({
  id: s.id,
  name: s.name,
  host: host(s.url),
  status: s.status,
  lastCheckedAt: new Date(SHARE_NOW).toISOString(),
  uptime: s.uptime,
  bars: barsFor(s.id),
}));

export const shareStatusUpdatedAt = new Date(SHARE_NOW).toISOString();

export const shareExpiryGroups: MonthGroup[] = groupByMonth(
  expiryEvents(
    sites.map((s) => ({
      id: s.id,
      name: s.name,
      url: s.url,
      sslExpiresAt: new Date(SHARE_NOW + s.sslDays * DAY),
      domainExpiresAt: new Date(SHARE_NOW + s.domainDays * DAY),
    })),
    SHARE_NOW,
  ),
  12,
  SHARE_NOW,
);

export const shareReport: WeeklyReport = {
  from: "2026-11-18",
  to: "2026-11-25",
  sites: sites.map((s) => ({
    id: s.id,
    name: s.name,
    url: s.url,
    uptime: s.uptime,
    incidents: s.incidents,
    downMs: s.downMs,
    avgMs: s.avgMs,
  })),
  uptime: 99.6,
  incidents: 1,
  expiries: [
    { siteName: "Launch page", kind: "Domain", date: "2026-12-01", daysLeft: 6 },
    { siteName: "Client blog", kind: "SSL", date: "2026-12-16", daysLeft: 21 },
  ],
  cronMissed: 0,
};

export type ShareChannel = {
  kind: "slack" | "discord" | "telegram" | "webhook";
  name: string;
  hint: string;
  events: string;
  scope: string;
  last: string;
};

export const shareChannels: ShareChannel[] = [
  { kind: "slack", name: "Studio Slack", hint: "#site-alerts", events: "All alerts", scope: "All sites", last: "25 Nov 2026, 11:42 am" },
  { kind: "discord", name: "Launch Discord", hint: "#status", events: "Site down, Site back up", scope: "2 of 4 sites", last: "25 Nov 2026, 9:40 am" },
  { kind: "telegram", name: "On-call Telegram", hint: "Private chat", events: "SSL expiry, Domain expiry", scope: "All sites", last: "16 Nov 2026, 8:02 am" },
];

export const shareEmailRows = [
  { title: "Site down and recovered", body: "When a check can't reach a site, and once when it's back up.", on: true },
  { title: "SSL certificate", body: "30, 7 and 1 day before expiry, when it expires, or if browsers stop trusting it.", on: true },
  { title: "Domain expiry", body: "30, 7 and 1 day before the domain expires, and when it has expired.", on: true },
];

export const shareAlertsCaption = `Email is included on every plan. Slack, Discord, Telegram and webhook channels: ${CHANNEL_LIMIT.starter} on Starter, ${CHANNEL_LIMIT.pro} on Pro, ${CHANNEL_LIMIT.business} on Business. We don't send SMS.`;

export const shareStatusCaption = `${planWord(STATUS_PAGE_LIMIT.starter, "status page")} on Starter, ${STATUS_PAGE_LIMIT.pro} on Pro, ${STATUS_PAGE_LIMIT.business} on Business. The weekly report, expiry calendar and badges are on every plan. Custom domains for status pages aren't available yet.`;

