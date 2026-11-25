/** The Worker's site list: who is checked, how often, in which order (see schedule.ts). */
import { prisma } from "@/lib/prisma";
import { getEffectivePlan } from "@/lib/plans";
import { isVerified } from "@/lib/email-verify";
import { isAdminEmail } from "@/lib/admin/access";
import { capacityUnits, intervalsForAccount, orderForWorker, type FeedSite } from "./schedule";

export async function workerFeed(): Promise<FeedSite[]> {
  const sites = await prisma.site.findMany({
    where: { locked: false },
    orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    select: {
      id: true,
      url: true,
      status: true,
      lastCheckedAt: true,
      userId: true,
      user: { select: { plan: true, dodoStatus: true, emailVerified: true, createdAt: true, email: true } },
    },
  });
  const byUser = new Map<string, typeof sites>();
  for (const s of sites) {
    if (!isVerified(s.user) || isAdminEmail(s.user.email)) continue;
    const list = byUser.get(s.userId) ?? [];
    list.push(s);
    byUser.set(s.userId, list);
  }
  const out: FeedSite[] = [];
  for (const list of byUser.values()) {
    const plan = getEffectivePlan(list[0].user.plan, list[0].user.dodoStatus);
    const every = intervalsForAccount(plan, list.length);
    list.forEach((s, idx) =>
      out.push({
        i: s.id,
        u: s.url,
        e: every[idx],
        // Down in the app (daily check or Recheck): when it went down, so the Worker reports a recovery.
        d: s.status === "down" || s.status === "error" ? (s.lastCheckedAt?.getTime() ?? 1) : 0,
      }),
    );
  }
  return orderForWorker(out);
}

/** Current Worker load (checks per minute on average). */
export async function currentCapacityUnits(): Promise<number> {
  return capacityUnits(await workerFeed());
}
