import { prisma } from "@/lib/prisma";
import { getEffectivePlan, type PlanId } from "@/lib/plans";
import type { ClientHb } from "./types";
import { liveStatus, overLimitIds, pingUrl } from "./worker";

export type { ClientHb };

export async function loadHeartbeats(userId: string, planIn?: PlanId): Promise<{ plan: PlanId; list: ClientHb[] }> {
  let plan = planIn;
  if (!plan) {
    const u = await prisma.user.findUnique({ where: { id: userId }, select: { plan: true, dodoStatus: true } });
    plan = getEffectivePlan(u?.plan, u?.dodoStatus);
  }
  const rows = await prisma.heartbeat.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
    include: { events: { orderBy: { at: "desc" }, take: 5, select: { kind: true, at: true } } },
  });
  const over = overLimitIds(rows, plan);
  const live = await liveStatus(rows.map((r) => r.id));
  const list = rows.map((r): ClientHb => {
    const l = live?.get(r.id);
    const lastPing = l && l.l > 0 ? l.l : (r.lastPingAt?.getTime() ?? null);
    let state: ClientHb["state"];
    if (over.has(r.id)) state = "over";
    else if (r.paused) state = "paused";
    else if (l) state = l.s === 2 ? "down" : l.s === 1 ? "up" : "waiting";
    else state = r.status === "down" ? "down" : r.status === "up" ? "up" : "waiting";
    return {
      id: r.id, name: r.name, url: pingUrl(r.token), periodSec: r.periodSec, graceSec: r.graceSec,
      paused: r.paused, over: over.has(r.id), state, lastPing,
      alertAt: state === "up" && l && l.d > 0 ? l.d : null,
      live: Boolean(l), incidents: r.events.map((e) => ({ kind: e.kind, at: e.at.getTime() })),
    };
  });
  return { plan, list };
}
