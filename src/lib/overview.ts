import { prisma } from "@/lib/prisma";
import { buildIncidents } from "@/lib/analytics";
import { percentOf, uptimeDays } from "@/lib/uptime-days";
import type { AccountSite } from "@/lib/account-load";

export type OverviewIncident = { siteId: string; siteName: string; startedAt: string; durationMs: number | null; ongoing: boolean; reason: string | null };
export type OverviewExpiry = { siteId: string; siteName: string; kind: "SSL" | "Domain"; daysLeft: number };
export type Setup = { sites: boolean; channels: boolean; statusPage: boolean; report: boolean; cron: boolean };

const WEEK = 7 * 86_400_000;

/** Everything the overview shows beyond the account itself, in one parallel round trip. */
export async function loadOverview(userId: string, active: AccountSite[], weeklyReport: boolean, heartbeatsOn: boolean) {
  const ids = active.map((s) => s.id);
  const [days, checks, channels, pages, hbs] = await Promise.all([
    uptimeDays(ids, 30),
    ids.length
      ? prisma.checkResult.findMany({
          where: { siteId: { in: ids }, checkedAt: { gte: new Date(Date.now() - WEEK) } },
          orderBy: { checkedAt: "asc" },
          select: { siteId: true, status: true, statusCode: true, latencyMs: true, error: true, checkedAt: true },
        })
      : Promise.resolve([]),
    prisma.alertChannel.findMany({ where: { userId, enabled: true }, select: { kind: true, name: true } }),
    prisma.statusPage.count({ where: { userId } }),
    heartbeatsOn ? prisma.heartbeat.count({ where: { userId } }) : Promise.resolve(0),
  ]);
  const names = new Map(active.map((s) => [s.id, s.name]));
  const incidents: OverviewIncident[] = ids
    .flatMap((id) =>
      buildIncidents(checks.filter((c) => c.siteId === id)).map((i) => ({
        siteId: id, siteName: names.get(id) ?? "Site", startedAt: i.startedAt, durationMs: i.durationMs, ongoing: !i.endedAt,
        reason: i.error || (i.statusCode ? `HTTP ${i.statusCode}` : null),
      })),
    )
    .sort((a, b) => b.startedAt.localeCompare(a.startedAt));
  const expiries: OverviewExpiry[] = active
    .flatMap((s) => [
      ...(s.sslDaysLeft != null ? [{ siteId: s.id, siteName: s.name, kind: "SSL" as const, daysLeft: s.sslDaysLeft }] : []),
      ...(s.domainDaysLeft != null ? [{ siteId: s.id, siteName: s.name, kind: "Domain" as const, daysLeft: s.domainDaysLeft }] : []),
    ])
    .sort((a, b) => a.daysLeft - b.daysLeft);
  const setup: Setup = { sites: active.length > 0, channels: channels.length > 0, statusPage: pages > 0, report: weeklyReport, cron: hbs > 0 };
  return { uptime30: percentOf(days), incidents, expiries, channels, setup };
}
