import { NextResponse } from "next/server";
import { z } from "zod";
import { HEARTBEATS } from "@/lib/heartbeats/config";
import { applyHeartbeatEvent } from "@/lib/heartbeats/apply";
import { monitorAuthorized, unauthorized } from "@/lib/monitor/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const schema = z.object({
  events: z
    .array(
      z.object({
        i: z.string().min(1).max(40),
        k: z.enum(["down", "up"]),
        at: z.number().int().positive(),
        l: z.number().int().min(0),
      }),
    )
    .max(80),
});

/** Missed / resumed heartbeats from the Worker. outcome: applied, missing (deleted) or retry. */
export async function POST(req: Request) {
  if (!monitorAuthorized(req)) return unauthorized();
  if (!HEARTBEATS) return NextResponse.json({ results: [] });
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Bad request" }, { status: 400 });
  const results = await Promise.all(
    parsed.data.events.map(async (ev) => {
      try {
        return { i: ev.i, outcome: await applyHeartbeatEvent(ev) };
      } catch (err) {
        console.error("[heartbeat] report failed", ev.i, err);
        return { i: ev.i, outcome: "retry" as const };
      }
    }),
  );
  return NextResponse.json({ results }, { headers: { "Cache-Control": "no-store" } });
}
