import type { Site } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { isVerified } from "@/lib/email-verify";
import { sendEmail } from "@/lib/email/send";
import { alertEmail } from "@/lib/email/alerts";
import { HOUR, rateLimit } from "@/lib/rate-limit";
import { dispatchToChannels } from "@/lib/channels/dispatch";
import { siteAlertMessage } from "@/lib/channels/messages";
import { planAlerts, type AlertPrefs, type PlannedAlert } from "./plan";
import { unsubscribeHeaders, unsubscribeLinks, type AlertScope } from "./unsubscribe";

/** Hard caps so a flapping or misconfigured site can never flood an inbox. */
const PER_USER_DAY = 20;
const PER_SITE_DAY = 6;

const scopeOf = (a: PlannedAlert): AlertScope => (a.kind === "recovered" ? "down" : a.kind);
const ALL_ON: AlertPrefs = { alertDown: true, alertSsl: true, alertDomain: true };

/** Whether the email preference allows this alert (chat channels have their own event list). */
export function emailAllowed(a: PlannedAlert, p: AlertPrefs): boolean {
  if (a.kind === "down" || a.kind === "recovered") return p.alertDown;
  return a.kind === "ssl" ? p.alertSsl : p.alertDomain;
}

/**
 * Called after every saved check (cron, Recheck, auto refresh). Never throws: alert problems
 * must not fail a check. Each alert is claimed in AlertLog (unique siteId+key) before sending,
 * and down/recovered also flip Site.alertDownAt atomically, so parallel checks can't double-send.
 */
export async function evaluateAlerts(site: Site, check: { statusCode?: number | null; error?: string | null }) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: site.userId },
      select: { id: true, email: true, emailVerified: true, createdAt: true, alertDown: true, alertSsl: true, alertDomain: true,
        _count: { select: { alertChannels: { where: { enabled: true } } } } },
    });
    if (!user || !isVerified(user)) return; // never email unverified accounts
    const checkedAt = site.lastCheckedAt ?? new Date();
    // With chat/webhook channels, plan every alert (channels choose their own events) and gate the
    // email per preference; without channels, plan only what the email preferences allow.
    const channels = user._count.alertChannels > 0;
    for (const a of planAlerts(site, channels ? ALL_ON : user, checkedAt)) {
      if (a.kind === "down" || a.kind === "recovered") {
        const flipped = await prisma.site.updateMany({
          where: { id: site.id, alertDownAt: a.kind === "down" ? null : site.alertDownAt },
          data: { alertDownAt: a.kind === "down" ? checkedAt : null },
        });
        if (flipped.count === 0) continue; // another check already handled this incident
      }
      // Claim (siteId, key) once; skipDuplicates = ON CONFLICT DO NOTHING, so a repeat is a quiet no-op.
      const claim = await prisma.alertLog.createMany({
        data: [{ userId: user.id, siteId: site.id, key: a.key, kind: a.kind }],
        skipDuplicates: true,
      });
      if (claim.count === 0) continue;
      if (channels) await dispatchToChannels(user.id, siteAlertMessage(a, { ...site, ...check }, checkedAt), site.id);
      if (!emailAllowed(a, user)) continue;
      const limited = await rateLimit([
        { key: `alert:user:${user.id}`, limit: PER_USER_DAY, windowMs: 24 * HOUR },
        { key: `alert:site:${site.id}`, limit: PER_SITE_DAY, windowMs: 24 * HOUR },
      ]);
      if (!limited.ok) {
        console.warn("[alerts] capped", site.id, a.key);
        continue;
      }
      const scope = scopeOf(a);
      const mail = alertEmail(a, { ...site, ...check, checkedAt }, unsubscribeLinks(user.id, scope));
      const res = await sendEmail({ to: user.email, ...mail, headers: unsubscribeHeaders(user.id, scope), tag: `alert:${a.kind}` });
      if (res.sent) {
        await prisma.alertLog.update({ where: { siteId_key: { siteId: site.id, key: a.key } }, data: { sent: true } });
      } else {
        console.warn("[alerts] not sent", a.key, res.reason);
      }
    }
  } catch (err) {
    console.error("[alerts] evaluate failed", site.id, err);
  }
}
