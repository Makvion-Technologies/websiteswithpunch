import { prisma } from "@/lib/prisma";
import { dayBars, percentOf, uptimeDays, type DayBar } from "@/lib/uptime-days";

export const STATUS_DAYS = 90;

export type PublicSite = { id: string; name: string; host: string; status: string; lastCheckedAt: string | null; uptime: number | null; bars: DayBar[] };
export type PublicStatus = { title: string; description: string | null; slug: string; updatedAt: string; sites: PublicSite[]; overall: "up" | "partial" | "down" | "unknown" };

const host = (url: string) => {
  try {
    return new URL(url).host;
  } catch {
    return url;
  }
};

/** Everything the public page shows. Only sites still owned by the page owner and not locked. */
export async function loadPublicStatus(slug: string, now = Date.now()): Promise<PublicStatus | null> {
  const page = await prisma.statusPage.findUnique({ where: { slug } });
  if (!page || !page.published) return null;
  const sites = await prisma.site.findMany({
    where: { id: { in: page.siteIds }, userId: page.userId, locked: false },
    select: { id: true, name: true, url: true, status: true, lastCheckedAt: true },
  });
  const order = new Map(page.siteIds.map((id, i) => [id, i]));
  sites.sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));
  const rows = await uptimeDays(sites.map((s) => s.id), STATUS_DAYS);
  const list: PublicSite[] = sites.map((s) => {
    const mine = rows.filter((r) => r.siteId === s.id);
    return {
      id: s.id, name: s.name, host: host(s.url), status: s.status,
      lastCheckedAt: s.lastCheckedAt?.toISOString() ?? null,
      uptime: percentOf(mine), bars: dayBars(mine, STATUS_DAYS, now),
    };
  });
  const failing = list.filter((s) => s.status === "down" || s.status === "error").length;
  const known = list.filter((s) => s.status !== "pending").length;
  const overall = !known ? "unknown" : failing === 0 ? "up" : failing === list.length ? "down" : "partial";
  return { title: page.title, description: page.description, slug: page.slug, updatedAt: new Date(now).toISOString(), sites: list, overall };
}
