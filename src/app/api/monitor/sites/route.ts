import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getEffectivePlan } from "@/lib/plans";
import { isVerified } from "@/lib/email-verify";
import { isAdminEmail } from "@/lib/admin/access";
import { CHECK_EVERY_MIN, FAST_CHECKS } from "@/lib/monitor/config";
import { monitorAuthorized, unauthorized } from "@/lib/monitor/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Site list for the monitor Worker (it caches this for an hour, so Neon wakes up rarely).
 * Only unlocked sites of verified, non-admin accounts. `e` = minutes between checks,
 * `d` = time of the app's last failed check while the site is down (0 when up).
 */
export async function GET(req: Request) {
  if (!monitorAuthorized(req)) return unauthorized();
  if (!FAST_CHECKS) return NextResponse.json({ enabled: false, sites: [] });
  const sites = await prisma.site.findMany({
    where: { locked: false },
    orderBy: { id: "asc" }, // stable batches in the Worker
    select: {
      id: true,
      url: true,
      status: true,
      lastCheckedAt: true,
      user: { select: { plan: true, dodoStatus: true, emailVerified: true, createdAt: true, email: true } },
    },
  });
  const out = sites
    .filter((s) => isVerified(s.user) && !isAdminEmail(s.user.email))
    .map((s) => ({
      i: s.id,
      u: s.url,
      e: CHECK_EVERY_MIN[getEffectivePlan(s.user.plan, s.user.dodoStatus)],
      // Down in the app (daily check or Recheck): when it went down, so the Worker reports a recovery.
      d: s.status === "down" || s.status === "error" ? (s.lastCheckedAt?.getTime() ?? 1) : 0,
    }));
  return NextResponse.json({ enabled: true, sites: out }, { headers: { "Cache-Control": "no-store" } });
}
