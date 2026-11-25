import { prisma } from "@/lib/prisma";
import { expiryEvents } from "@/lib/expiry/events";
import { buildIcs, readCalendarKey } from "@/lib/expiry/ics";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Private .ics feed (the signed key is the only access check, like a calendar "secret address"). */
export async function GET(_req: Request, props: { params: Promise<{ key: string }> }) {
  const { key } = await props.params;
  const userId = readCalendarKey(key);
  if (!userId) return new Response("Not found", { status: 404 });
  const sites = await prisma.site.findMany({
    where: { userId, locked: false },
    select: { id: true, name: true, url: true, sslExpiresAt: true, domainExpiresAt: true },
  });
  return new Response(buildIcs(expiryEvents(sites)), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'inline; filename="websites-with-punch-expiries.ics"',
      "Cache-Control": "private, max-age=3600",
    },
  });
}
