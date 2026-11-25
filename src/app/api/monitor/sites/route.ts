import { NextResponse } from "next/server";
import { markRun } from "@/lib/admin/jobs";
import { FAST_CHECKS } from "@/lib/monitor/config";
import { workerFeed } from "@/lib/monitor/feed";
import { monitorAuthorized, unauthorized } from "@/lib/monitor/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Site list for the monitor Worker (it caches this for an hour, so Neon wakes up rarely).
 * Only unlocked sites of verified, non-admin accounts, sorted by interval and phase
 * (lib/monitor/schedule.ts). `e` = minutes between checks, `d` = time of the app's last failed check while the site is down (0 when up).
 */
export async function GET(req: Request) {
  if (!monitorAuthorized(req)) return unauthorized();
  if (!FAST_CHECKS) return NextResponse.json({ enabled: false, sites: [] });
  const out = await workerFeed();
  markRun("worker:sites", true, undefined, `${out.length} sites`);
  return NextResponse.json({ enabled: true, sites: out }, { headers: { "Cache-Control": "no-store" } });
}
