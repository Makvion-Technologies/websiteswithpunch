import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { FAST_CHECKS } from "@/lib/monitor/config";
import { monitorAuthorized, unauthorized } from "@/lib/monitor/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const row = z.object({
  i: z.string().min(1).max(40), // site id
  n: z.number().int().min(1).max(100), // checks in the hour
  f: z.number().int().min(0).max(100), // failed checks
  m: z.number().int().min(0).max(120_000).nullable(), // median response time of the ok checks
  t: z.number().int().positive(), // time of the last check
  c: z.number().int().nullable(), // last status code
  d: z.union([z.literal(0), z.literal(1)]), // confirmed incident open at the end of the hour
});
const schema = z.object({ rows: z.array(row).max(20_000) });

/**
 * Hourly roll-up from the Worker: one CheckResult per site per hour (samples/failures say how
 * many checks it stands for) and the latest response time on the Site. One request an hour
 * instead of one per check keeps Neon asleep most of the time.
 */
export async function POST(req: Request) {
  if (!monitorAuthorized(req)) return unauthorized();
  if (!FAST_CHECKS) return NextResponse.json({ saved: 0 });
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Bad request" }, { status: 400 });
  const rows = parsed.data.rows;
  if (rows.length === 0) return NextResponse.json({ saved: 0 });

  const live = await prisma.site.findMany({ where: { id: { in: rows.map((r) => r.i) }, locked: false }, select: { id: true } });
  const ok = new Set(live.map((s) => s.id));
  const keep = rows.filter((r) => ok.has(r.i));
  if (keep.length === 0) return NextResponse.json({ saved: 0 });

  await prisma.checkResult.createMany({
    data: keep.map((r) => ({
      siteId: r.i,
      status: r.d ? (r.c ? "down" : "error") : "up",
      statusCode: r.c,
      latencyMs: r.m,
      error: r.d ? "Down (confirmed from two locations)" : r.f ? `${r.f} of ${r.n} checks this hour failed` : null,
      checkedAt: new Date(r.t),
      samples: r.n,
      failures: r.f,
    })),
  });
  const withMs = keep.filter((r) => r.m != null && !r.d);
  if (withMs.length) {
    await prisma.$executeRaw`
      UPDATE "Site" AS s SET "lastLatencyMs" = v.ms, "lastStatusCode" = v.code
      FROM (SELECT unnest(${withMs.map((r) => r.i)}::text[]) AS id,
                   unnest(${withMs.map((r) => r.m)}::int[]) AS ms,
                   unnest(${withMs.map((r) => r.c)}::int[]) AS code) AS v
      WHERE s.id = v.id AND s.status = 'up'`;
  }
  return NextResponse.json({ saved: keep.length }, { headers: { "Cache-Control": "no-store" } });
}
