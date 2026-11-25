import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

/** Per-site, per-UTC-day check counts (same rule as site analytics: a row counts as one check). */
export type DayRow = { siteId: string; day: string; total: number; up: number };

export async function uptimeDays(siteIds: string[], days: number): Promise<DayRow[]> {
  if (!siteIds.length) return [];
  const rows = await prisma.$queryRaw<Array<{ siteId: string; day: Date; total: bigint; up: bigint }>>`
    SELECT "siteId", date_trunc('day', "checkedAt" AT TIME ZONE 'UTC') AS day,
           COUNT(*) AS total, COUNT(*) FILTER (WHERE status = 'up') AS up
    FROM "CheckResult"
    WHERE "siteId" IN (${Prisma.join(siteIds)}) AND "checkedAt" >= now() - (${days}::int * interval '1 day')
    GROUP BY 1, 2`;
  return rows.map((r) => ({ siteId: r.siteId, day: new Date(r.day).toISOString().slice(0, 10), total: Number(r.total), up: Number(r.up) }));
}

/** Uptime % (1 decimal) over the rows, or null without data. */
export function percentOf(rows: Array<{ total: number; up: number }>): number | null {
  const total = rows.reduce((n, r) => n + r.total, 0);
  if (!total) return null;
  return Math.floor((rows.reduce((n, r) => n + r.up, 0) / total) * 1000) / 10;
}

export type DayBar = { day: string; pct: number | null };

/** Last `days` UTC days, oldest first, with null where nothing was checked. */
export function dayBars(rows: DayRow[], days: number, now = Date.now()): DayBar[] {
  const byDay = new Map(rows.map((r) => [r.day, r]));
  const out: DayBar[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const day = new Date(now - i * 86_400_000).toISOString().slice(0, 10);
    const r = byDay.get(day);
    out.push({ day, pct: r && r.total ? Math.round((r.up / r.total) * 1000) / 10 : null });
  }
  return out;
}
