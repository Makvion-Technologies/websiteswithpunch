import { prisma } from "@/lib/prisma";
import { evaluateAlerts } from "@/lib/alerts";

export type MonitorEvent = {
  siteId: string;
  kind: "down" | "up";
  at: number;
  statusCode: number | null;
  latencyMs: number | null;
  error: string | null;
};

/**
 * Saves a confirmed state change from the monitor and runs the normal alert path
 * (verified accounts only, alert preferences, unsubscribe links, AlertLog once-only claims and
 * the per-user/per-site daily caps). Site.lastCheckedAt is left alone: it is the Recheck
 * cooldown slot, and the new CheckResult row already shows as the latest check.
 */
export async function applyMonitorEvent(ev: MonitorEvent): Promise<"saved" | "missing"> {
  const site = await prisma.site.findUnique({ where: { id: ev.siteId } });
  if (!site || site.locked) return "missing";
  const status = ev.kind === "up" ? "up" : ev.statusCode ? "down" : "error";
  const checkedAt = new Date(ev.at);
  const [updated] = await prisma.$transaction([
    prisma.site.update({
      where: { id: site.id },
      data: { status, lastStatusCode: ev.statusCode, lastLatencyMs: ev.latencyMs },
    }),
    prisma.checkResult.create({
      data: {
        siteId: site.id, status, statusCode: ev.statusCode, latencyMs: ev.latencyMs,
        error: ev.error, checkedAt, samples: 1, failures: ev.kind === "up" ? 0 : 1,
      },
    }),
  ]);
  // evaluateAlerts keys "down" on the check time; use the monitor's time, not "now".
  await evaluateAlerts({ ...updated, lastCheckedAt: checkedAt }, { statusCode: ev.statusCode, error: ev.error });
  return "saved";
}
