import { prisma } from "@/lib/prisma";
import { currentCapacityUnits } from "@/lib/monitor/feed";
import { PLAN_BUCKETS, RESEND_DAILY_LIMIT, WORKER_CAPACITY_PER_MIN, monthlyValue, planBucketOf, segmentOf, type PlanBucket, type Segment } from "./plan-mix";

const DAY = 86_400_000;
const ago = (now: number, d: number) => new Date(now - d * DAY);

/** Platform KPIs for the admin Overview. Real counts; MRR is an estimate at monthly list price. */
export async function platformKpis(now = Date.now()) {
  const [users, new7, new30, dau, wau, mau, billing, cancelled30, cancelling, sites, perMin, emails, trialsStarted, trialsConverted] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: ago(now, 7) } } }),
    prisma.user.count({ where: { createdAt: { gte: ago(now, 30) } } }),
    prisma.user.count({ where: { lastActiveAt: { gte: ago(now, 1) } } }),
    prisma.user.count({ where: { lastActiveAt: { gte: ago(now, 7) } } }),
    prisma.user.count({ where: { lastActiveAt: { gte: ago(now, 30) } } }),
    prisma.user.findMany({
      select: { plan: true, dodoStatus: true, sitePackCount: true, legacyFree: true, trialEndsAt: true, trialConvertedAt: true },
    }),
    prisma.user.count({ where: { dodoStatus: { in: ["cancelled", "expired"] }, dodoSyncedAt: { gte: ago(now, 30) } } }),
    prisma.user.count({ where: { cancelAtPeriodEnd: true } }),
    prisma.site.count({ where: { locked: false } }),
    // Same feed and intervals the Worker gets (paid 1 min, legacy Free 5, extra Custom sites 3).
    currentCapacityUnits(),
    emailsLast24h(now),
    prisma.user.count({ where: { trialStartedAt: { not: null } } }),
    prisma.user.count({ where: { trialConvertedAt: { not: null } } }),
  ]);
  const seg: Record<Segment, number> = { paid: 0, trial: 0, "at-risk": 0, "legacy-free": 0, "no-plan": 0 };
  const plans = Object.fromEntries(PLAN_BUCKETS.map((b) => [b, 0])) as Record<PlanBucket, number>;
  let mrr = 0;
  for (const r of billing) {
    seg[segmentOf(r, now)] += 1;
    plans[planBucketOf(r, now)] += 1;
    mrr += monthlyValue(r, now);
  }
  // Trials that finished: converted, or ended without converting (not running any more).
  const trialsEnded = Math.max(0, trialsStarted - seg.trial);
  const trials = {
    running: seg.trial,
    started: trialsStarted,
    converted: trialsConverted,
    conversionPct: trialsEnded ? Math.round((Math.min(trialsConverted, trialsEnded) / trialsEnded) * 1000) / 10 : null,
  };
  return {
    users, new7, new30, dau, wau, mau, seg, plans, trials, mrr: Math.round(mrr), cancelled30, cancelling, sites,
    capacity: { perMin: Math.round(perMin), limit: WORKER_CAPACITY_PER_MIN },
    emails: { ...emails, limit: RESEND_DAILY_LIMIT },
    // Paying = billed subscriptions, including payment issues still in retry; trials excluded.
    paidShare: users ? Math.round(((seg.paid + seg["at-risk"]) / users) * 1000) / 10 : 0,
  };
}

/**
 * Emails sent in the last 24 hours, estimated from the rows each kind of email leaves behind
 * (alerts, weekly reports, verification codes, password resets, contact forwards). No extra table.
 */
export async function emailsLast24h(now = Date.now()) {
  const since = ago(now, 1);
  const [alerts, reports, codes, resets, contact] = await Promise.all([
    prisma.alertLog.count({ where: { sent: true, createdAt: { gte: since } } }),
    prisma.user.count({ where: { weeklyReportSentAt: { gte: since } } }),
    prisma.emailVerificationCode.count({ where: { createdAt: { gte: since } } }),
    prisma.passwordResetToken.count({ where: { createdAt: { gte: since } } }),
    prisma.contactMessage.count({ where: { emailSent: true, createdAt: { gte: since } } }),
  ]);
  return { total: alerts + reports + codes + resets + contact, parts: { alerts, reports, codes, resets, contact } };
}

/** Sign-ups per IST day for the last `days` days, oldest first, zero-filled. */
export async function signupSeries(days: number, now = Date.now()) {
  const rows = await prisma.$queryRaw<Array<{ d: string; n: bigint }>>`
    SELECT to_char(("createdAt" AT TIME ZONE 'UTC') AT TIME ZONE 'Asia/Kolkata', 'YYYY-MM-DD') AS d, COUNT(*)::bigint AS n
    FROM "User" WHERE "createdAt" >= ${ago(now, days + 1)} GROUP BY 1`;
  const map = new Map(rows.map((r) => [r.d, Number(r.n)]));
  return istDays(days, now).map((d) => ({ d, n: map.get(d) ?? 0 }));
}

/** The last `days` calendar days in IST as YYYY-MM-DD, oldest first. */
export function istDays(days: number, now = Date.now()): string[] {
  const out: string[] = [];
  for (let i = days - 1; i >= 0; i--) out.push(new Date(now - i * DAY + 5.5 * 3_600_000).toISOString().slice(0, 10));
  return out;
}

/** Top countries by users (last known location). */
export async function topCountries(take = 6) {
  const rows = await prisma.user.groupBy({ by: ["lastCountry"], _count: { _all: true }, where: { lastCountry: { not: null } }, orderBy: { _count: { lastCountry: "desc" } }, take });
  return rows.map((r) => ({ country: r.lastCountry!, n: r._count._all }));
}

/** Top first-touch sources. */
export async function topSources(take = 6) {
  const rows = await prisma.user.groupBy({ by: ["signupSource"], _count: { _all: true }, where: { signupSource: { not: null } }, orderBy: { _count: { signupSource: "desc" } }, take });
  return rows.map((r) => ({ source: r.signupSource!, n: r._count._all }));
}
