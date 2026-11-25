import { prisma } from "@/lib/prisma";
import { readBadgeKey } from "@/lib/badges/sign";
import { BADGE_COLORS, badgeSvg, uptimeColor } from "@/lib/badges/svg";
import { percentOf, uptimeDays } from "@/lib/uptime-days";

export const runtime = "nodejs";

const CACHE = "public, max-age=300, s-maxage=300, stale-while-revalidate=600";

function reply(svg: string, status = 200) {
  return new Response(svg, {
    status,
    headers: { "Content-Type": "image/svg+xml; charset=utf-8", "Cache-Control": status === 200 ? CACHE : "public, max-age=60", "X-Content-Type-Options": "nosniff" },
  });
}

/** Public SVG badge: /badge/<key>.svg (30-day uptime) or ?type=status (up / down now). */
export async function GET(req: Request, props: { params: Promise<{ key: string }> }) {
  const { key } = await props.params;
  const siteId = readBadgeKey(key);
  if (!siteId) return reply(badgeSvg("uptime", "unknown", BADGE_COLORS.none), 404);
  const site = await prisma.site.findUnique({ where: { id: siteId }, select: { id: true, status: true, locked: true } });
  if (!site || site.locked) return reply(badgeSvg("uptime", "unknown", BADGE_COLORS.none), 404);
  const type = new URL(req.url).searchParams.get("type");
  if (type === "status") {
    const up = site.status === "up";
    const value = site.status === "pending" ? "pending" : up ? "up" : "down";
    return reply(badgeSvg("status", value, up ? BADGE_COLORS.up : site.status === "pending" ? BADGE_COLORS.none : BADGE_COLORS.down));
  }
  const pct = percentOf(await uptimeDays([site.id], 30));
  return reply(badgeSvg("uptime 30d", pct == null ? "no data" : `${pct}%`, uptimeColor(pct)));
}
