import { NextResponse } from "next/server";
import { z } from "zod";
import { checkUptime } from "@/lib/checks";
import { FAST_CHECKS } from "@/lib/monitor/config";
import { monitorAuthorized, unauthorized } from "@/lib/monitor/auth";
import { applyMonitorEvent } from "@/lib/monitor/apply";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const schema = z.object({
  events: z
    .array(
      z.object({
        siteId: z.string().min(1).max(40),
        url: z.string().min(3).max(500),
        kind: z.enum(["down", "up"]),
        at: z.number().int().positive(),
        statusCode: z.number().int().nullable(),
        latencyMs: z.number().int().nullable(),
        error: z.string().max(300).nullable(),
      }),
    )
    .max(50),
});

/**
 * State changes seen by the Worker (already retried there). A "down" is only saved when this
 * server, in another network and region (Vercel sin1), also can't load the site: the second
 * opinion runs before the database is touched, so false alarms don't wake Neon either.
 */
export async function POST(req: Request) {
  if (!monitorAuthorized(req)) return unauthorized();
  if (!FAST_CHECKS) return NextResponse.json({ results: [] });
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Bad request" }, { status: 400 });

  // outcome: confirmed (down saved + alerts run), not_confirmed (second check passed),
  // applied (recovery saved), missing (site gone or locked), retry (server error).
  const results = await Promise.all(
    parsed.data.events.map(async (ev) => {
      try {
        if (ev.kind === "down") {
          const second = await checkUptime(ev.url);
          if (second.status === "up") return { siteId: ev.siteId, outcome: "not_confirmed" };
          const saved = await applyMonitorEvent({
            ...ev,
            statusCode: second.statusCode ?? ev.statusCode,
            error: second.error ?? ev.error,
          });
          return { siteId: ev.siteId, outcome: saved === "saved" ? "confirmed" : "missing" };
        }
        const saved = await applyMonitorEvent(ev);
        return { siteId: ev.siteId, outcome: saved === "saved" ? "applied" : "missing" };
      } catch (err) {
        console.error("[monitor] report failed", ev.siteId, err);
        return { siteId: ev.siteId, outcome: "retry" };
      }
    }),
  );
  return NextResponse.json({ results }, { headers: { "Cache-Control": "no-store" } });
}
