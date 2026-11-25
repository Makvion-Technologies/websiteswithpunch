import { prisma } from "@/lib/prisma";
import { referrerTotals } from "./referrer";

/** Everything the admin user page shows, in one round of parallel queries. Secrets never leave here. */
export async function loadUserDetail(rawId: string) {
  const id = rawId.slice(0, 40);
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true, email: true, name: true, plan: true, emailVerified: true, createdAt: true, updatedAt: true,
      sitePackCount: true, pendingSitePackCount: true, pendingPackChangeAt: true, pendingPlan: true, pendingPlanAt: true,
      cancelAtPeriodEnd: true, dodoCustomerId: true, dodoSubscriptionId: true, dodoStatus: true, dodoSyncedAt: true,
      lastActiveAt: true, lastLoginAt: true, lastCountry: true, lastRegion: true, lastCity: true, lastDevice: true,
      signupCountry: true, signupCity: true, signupSource: true, signupUtm: true,
      referralCode: true, referralClicks: true, referredAt: true, payoutMethod: true, payoutAddress: true,
      weeklyReport: true, alertDown: true, alertSsl: true, alertDomain: true,
      referredBy: { select: { id: true, email: true } },
      _count: { select: { referrals: true, heartbeats: true } },
    },
  });
  if (!user) return null;
  const [sites, channels, pages, activity, audit, commissions, payouts, paidFor, totals] = await Promise.all([
    prisma.site.findMany({
      where: { userId: id }, orderBy: { createdAt: "asc" }, take: 200,
      select: { id: true, name: true, url: true, status: true, locked: true, lastCheckedAt: true, lastLatencyMs: true, sslDaysLeft: true, domainDaysLeft: true },
    }),
    prisma.alertChannel.findMany({ where: { userId: id }, orderBy: { createdAt: "asc" }, select: { id: true, kind: true, name: true, hint: true, enabled: true, events: true, lastSentAt: true, lastError: true } }),
    prisma.statusPage.findMany({ where: { userId: id }, orderBy: { createdAt: "asc" }, select: { id: true, slug: true, title: true, published: true, siteIds: true } }),
    prisma.userActivity.findMany({ where: { userId: id }, orderBy: { at: "desc" }, take: 40 }),
    prisma.auditLog.findMany({ where: { OR: [{ actorId: id }, { targetId: id }] }, orderBy: { createdAt: "desc" }, take: 20, select: { id: true, action: true, createdAt: true } }),
    prisma.commission.findMany({ where: { referrerId: id }, orderBy: { createdAt: "desc" }, take: 20, select: { id: true, amountCents: true, status: true, createdAt: true, clawback: true, referredUser: { select: { email: true } } } }),
    prisma.payout.findMany({ where: { userId: id }, orderBy: { createdAt: "desc" }, take: 20, select: { id: true, amountCents: true, status: true, createdAt: true, method: true } }),
    // Payments this user made that earned a referrer commission (the only payment rows stored locally).
    prisma.commission.findMany({ where: { referredUserId: id }, orderBy: { createdAt: "desc" }, take: 20, select: { id: true, paymentId: true, baseCents: true, currency: true, status: true, createdAt: true } }),
    referrerTotals([id]),
  ]);
  return { user, sites, channels, pages, activity, audit, commissions, payouts, paidFor, totals: totals.get(id) };
}
export type UserDetail = NonNullable<Awaited<ReturnType<typeof loadUserDetail>>>;
