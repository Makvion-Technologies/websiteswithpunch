import { NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { HEARTBEATS } from "@/lib/heartbeats/config";
import { monitorAuthorized, unauthorized } from "@/lib/monitor/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  at: z.number().int().positive(),
  rows: z.array(z.object({ i: z.string().min(1).max(40), c: z.number().int().min(0).max(100_000), l: z.number().int().min(0) })).max(100),
});

/**
 * Hourly from the Worker: pings recorded per heartbeat in the last hour. Adds them to that
 * day's count (90-day history) and stores the last ping time. Two queries for the whole batch.
 */
export async function POST(req: Request) {
  if (!monitorAuthorized(req)) return unauthorized();
  if (!HEARTBEATS) return NextResponse.json({ saved: 0 });
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Bad request" }, { status: 400 });
  const { at, rows } = parsed.data;
  if (rows.length === 0) return NextResponse.json({ saved: 0 });
  const day = new Date(at).toISOString().slice(0, 10);
  const known = await prisma.heartbeat.findMany({ where: { id: { in: rows.map((r) => r.i) } }, select: { id: true } });
  const ids = new Set(known.map((k) => k.id));
  const keep = rows.filter((r) => ids.has(r.i));
  if (keep.length === 0) return NextResponse.json({ saved: 0 });
  const days = Prisma.join(keep.map((r) => Prisma.sql`(${r.i}, ${day}::date, ${r.c})`));
  const pings = Prisma.join(keep.filter((r) => r.l > 0).map((r) => Prisma.sql`(${r.i}, (${new Date(r.l).toISOString()}::timestamptz AT TIME ZONE 'UTC'))`));
  await prisma.$transaction([
    prisma.$executeRaw`INSERT INTO "HeartbeatDay" ("heartbeatId", "day", "pings") VALUES ${days}
      ON CONFLICT ("heartbeatId", "day") DO UPDATE SET "pings" = "HeartbeatDay"."pings" + EXCLUDED."pings"`,
    ...(keep.some((r) => r.l > 0)
      ? [prisma.$executeRaw`UPDATE "Heartbeat" AS h SET "lastPingAt" = v.l,
          "status" = CASE WHEN h."status" = 'new' THEN 'up' ELSE h."status" END FROM (VALUES ${pings}) AS v(id, l)
          WHERE h.id = v.id AND (h."lastPingAt" IS NULL OR h."lastPingAt" < v.l)`]
      : []),
  ]);
  return NextResponse.json({ saved: keep.length }, { headers: { "Cache-Control": "no-store" } });
}
