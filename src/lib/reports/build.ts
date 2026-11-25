import { prisma } from "@/lib/prisma";
import { buildIncidents } from "@/lib/analytics";
import { percentOf } from "@/lib/uptime-days";

export type ReportSite = { id: string; name: string; url: string; uptime: number | null; incidents: number; downMs: number; avgMs: number | null };
export type ReportExpiry = { siteName: string; kind: "SSL" | "Domain"; date: string; daysLeft: number };
export type WeeklyReport = {
  from: string;
  to: string;
  sites: ReportSite[];
  uptime: number | null;
  incidents: number;
  expiries: ReportExpiry[];
  cronMissed: number;
};

const WEEK = 7 * 86_400_000;

/** Last 7 days for one user (same counting as site analytics). */
export async function buildWeeklyReport(userId: string, now = Date.now()): Promise<WeeklyReport> {
  const since = new Date(now - WEEK);
  const sites = await prisma.site.findMany({
    where: { userId, locked: false },
    select: { id: true, name: true, url: true, sslExpiresAt: true, domainExpiresAt: true },
    orderBy: { createdAt: "asc" },
  });
  const ids = sites.map((s) => s.id);
  const [checks, missed] = await Promise.all([
    ids.length
      ? prisma.checkResult.findMany({
          where: { siteId: { in: ids }, checkedAt: { gte: since } },
          orderBy: { checkedAt: "asc" },
          select: { siteId: true, status: true, statusCode: true, latencyMs: true, error: true, checkedAt: true },
        })
      : Promise.resolve([]),
    prisma.heartbeatEvent.count({ where: { kind: "down", at: { gte: since }, heartbeat: { userId } } }),
  ]);
  const list: ReportSite[] = sites.map((s) => {
    const mine = checks.filter((c) => c.siteId === s.id);
    const inc = buildIncidents(mine);
    const ms = mine.map((c) => c.latencyMs).filter((v): v is number => v != null && v > 0);
    return {
      id: s.id, name: s.name, url: s.url,
      uptime: percentOf([{ total: mine.length, up: mine.filter((c) => c.status === "up").length }]),
      incidents: inc.length,
      downMs: inc.reduce((n, i) => n + (i.durationMs ?? 0), 0),
      avgMs: ms.length ? Math.round(ms.reduce((a, b) => a + b, 0) / ms.length) : null,
    };
  });
  const expiries: ReportExpiry[] = [];
  for (const s of sites) {
    for (const [kind, d] of [["SSL", s.sslExpiresAt], ["Domain", s.domainExpiresAt]] as const) {
      if (!d) continue;
      const daysLeft = Math.ceil((d.getTime() - now) / 86_400_000);
      if (daysLeft <= 30) expiries.push({ siteName: s.name, kind, date: d.toISOString().slice(0, 10), daysLeft });
    }
  }
  expiries.sort((a, b) => a.daysLeft - b.daysLeft);
  return {
    from: since.toISOString().slice(0, 10),
    to: new Date(now).toISOString().slice(0, 10),
    sites: list.sort((a, b) => (a.uptime ?? 101) - (b.uptime ?? 101)),
    uptime: percentOf([{ total: checks.length, up: checks.filter((c) => c.status === "up").length }]),
    incidents: list.reduce((n, s) => n + s.incidents, 0),
    expiries,
    cronMissed: missed,
  };
}
