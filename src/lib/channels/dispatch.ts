import { prisma } from "@/lib/prisma";
import { HOUR, rateLimit } from "@/lib/rate-limit";
import { deliver } from "./deliver";
import type { AlertMessage } from "./types";

/** Per-channel daily cap, so a flapping site can't flood a Slack channel either. */
const PER_CHANNEL_DAY = 60;

/** True when the user has at least one enabled channel (cheap check before planning alerts). */
export async function hasChannels(userId: string): Promise<boolean> {
  return (await prisma.alertChannel.count({ where: { userId, enabled: true } })) > 0;
}

/**
 * Sends one alert to every matching channel of the user. Site events honour per-channel site
 * routing; cron job events go to channels that chose the "heartbeat" event. Never throws.
 */
export async function dispatchToChannels(userId: string, m: AlertMessage, siteId?: string): Promise<number> {
  try {
    const rows = await prisma.alertChannel.findMany({
      where: { userId, enabled: true, events: { has: m.event } },
      select: { id: true, kind: true, config: true, allSites: true, siteIds: true },
    });
    const targets = rows.filter((c) => !siteId || c.allSites || c.siteIds.includes(siteId));
    let sent = 0;
    await Promise.all(
      targets.map(async (c) => {
        const lim = await rateLimit([{ key: `chan:${c.id}`, limit: PER_CHANNEL_DAY, windowMs: 24 * HOUR }]);
        if (!lim.ok) return;
        const r = await deliver(c, m);
        if (r.ok) sent += 1;
        await prisma.alertChannel
          .update({ where: { id: c.id }, data: r.ok ? { lastSentAt: new Date(), lastError: null } : { lastError: r.error.slice(0, 200) } })
          .catch(() => undefined);
      }),
    );
    return sent;
  } catch (err) {
    console.error("[channels] dispatch failed", userId, err);
    return 0;
  }
}
