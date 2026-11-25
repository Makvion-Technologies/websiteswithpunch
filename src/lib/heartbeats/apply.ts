import { prisma } from "@/lib/prisma";
import { isVerified } from "@/lib/email-verify";
import { sendEmail } from "@/lib/email/send";
import { heartbeatEmail } from "@/lib/email/heartbeat";
import { HOUR, rateLimit } from "@/lib/rate-limit";
import { unsubscribeHeaders, unsubscribeLinks } from "@/lib/alerts/unsubscribe";
import { dispatchToChannels } from "@/lib/channels/dispatch";
import { heartbeatMessage } from "@/lib/channels/messages";

export type HbEvent = { i: string; k: "down" | "up"; at: number; l: number };

/** Same caps as site alerts: the per-user cap is shared, so heartbeats can't flood an inbox. */
const PER_USER_DAY = 20;
const PER_HB_DAY = 6;

/**
 * Saves a missed / resumed heartbeat reported by the Worker and emails the owner through the
 * normal alert rules (verified accounts, the "down" preference and its unsubscribe link, daily
 * caps). The event key is unique per heartbeat, so a repeated report never sends twice.
 */
export async function applyHeartbeatEvent(ev: HbEvent): Promise<"applied" | "missing"> {
  const hb = await prisma.heartbeat.findUnique({
    where: { id: ev.i },
    include: { user: { select: { id: true, email: true, emailVerified: true, createdAt: true, alertDown: true } } },
  });
  if (!hb) return "missing";
  const at = new Date(ev.at);
  const lastPingAt = ev.l > 0 ? new Date(ev.l) : hb.lastPingAt;
  const down = ev.k === "down";
  // Flip status and the alert marker in one guarded write, so parallel reports can't double-send.
  const flipped = await prisma.heartbeat.updateMany({
    where: { id: hb.id, alertDownAt: down ? null : { not: null } },
    data: { status: down ? "down" : "up", lastPingAt, alertDownAt: down ? at : null },
  });
  if (flipped.count === 0) {
    // Already in that state (or resumed without a recorded miss): keep the status in step only.
    await prisma.heartbeat.update({ where: { id: hb.id }, data: { status: down ? "down" : "up", lastPingAt } });
    return "applied";
  }
  const key = down ? `down:${at.toISOString()}` : `up:${hb.alertDownAt?.toISOString() ?? at.toISOString()}`;
  const claim = await prisma.heartbeatEvent.createMany({
    data: [{ heartbeatId: hb.id, kind: ev.k, key, at, lastPingAt }],
    skipDuplicates: true,
  });
  const u = hb.user;
  if (claim.count > 0 && !hb.paused && isVerified(u)) {
    await dispatchToChannels(u.id, heartbeatMessage(ev.k, { id: hb.id, name: hb.name, lastPingAt }, at));
  }
  if (claim.count === 0 || !u.alertDown || !isVerified(u) || hb.paused) return "applied";
  const limited = await rateLimit([
    { key: `alert:user:${u.id}`, limit: PER_USER_DAY, windowMs: 24 * HOUR },
    { key: `alert:hb:${hb.id}`, limit: PER_HB_DAY, windowMs: 24 * HOUR },
  ]);
  if (!limited.ok) return "applied";
  try {
    const mail = heartbeatEmail(
      ev.k,
      { name: hb.name, periodSec: hb.periodSec, graceSec: hb.graceSec, lastPingAt, at, downSince: hb.alertDownAt },
      unsubscribeLinks(u.id, "down"),
    );
    const res = await sendEmail({ to: u.email, ...mail, headers: unsubscribeHeaders(u.id, "down"), tag: `alert:hb-${ev.k}` });
    if (res.sent) await prisma.heartbeatEvent.update({ where: { heartbeatId_key: { heartbeatId: hb.id, key } }, data: { sent: true } });
    else console.warn("[heartbeat] not sent", hb.id, res.reason);
  } catch (err) {
    console.error("[heartbeat] alert failed", hb.id, err);
  }
  return "applied";
}
