import { NextResponse } from "next/server";
import { markRun } from "@/lib/admin/jobs";
import { prisma } from "@/lib/prisma";
import { getEffectivePlan } from "@/lib/plans";
import { isVerified } from "@/lib/email-verify";
import { isAdminEmail } from "@/lib/admin/access";
import { HEARTBEATS } from "@/lib/heartbeats/config";
import { overLimitIds, toWorker } from "@/lib/heartbeats/worker";
import { monitorAuthorized, unauthorized } from "@/lib/monitor/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Heartbeat list for the monitor Worker (copied hourly and after a change). Verified, non-admin
 * accounts only; heartbeats over the plan limit (after a downgrade) are sent as paused.
 */
export async function GET(req: Request) {
  if (!monitorAuthorized(req)) return unauthorized();
  if (!HEARTBEATS) return NextResponse.json({ enabled: false, hbs: [] });
  const rows = await prisma.heartbeat.findMany({
    orderBy: { createdAt: "asc" },
    select: {
      id: true, token: true, periodSec: true, graceSec: true, paused: true, createdAt: true, userId: true,
      user: { select: { plan: true, dodoStatus: true, emailVerified: true, createdAt: true, email: true } },
    },
  });
  const byUser = new Map<string, typeof rows>();
  for (const r of rows) byUser.set(r.userId, [...(byUser.get(r.userId) ?? []), r]);
  const hbs = [];
  for (const list of byUser.values()) {
    const u = list[0].user;
    if (!isVerified(u) || isAdminEmail(u.email)) continue;
    const plan = getEffectivePlan(u.plan, u.dodoStatus);
    const over = overLimitIds(list, plan);
    for (const h of list) hbs.push(toWorker(h, plan, over.has(h.id)));
  }
  markRun("worker:heartbeats", true, undefined, `${hbs.length} heartbeats`);
  return NextResponse.json({ enabled: true, hbs }, { headers: { "Cache-Control": "no-store" } });
}
