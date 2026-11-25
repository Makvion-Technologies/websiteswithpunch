import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getEffectiveSiteLimit, LOWER_PLAN, PLANS, planDisplayName } from "@/lib/plans";
import { formatPlanPrice } from "@/lib/billing-interval";
import { formatShortDate } from "@/lib/billing-format";
import { blockIfScheduled, fail, withSubscription } from "@/lib/billing-route";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** One tier down at renewal: what stays until then and what applies after. */
export async function GET() {
  return withSubscription({ label: "preview-downgrade" }, async ({ user, st }) => {
    if (st.plan === "starter") return fail(400, "Starter is the smallest plan.");
    const to = LOWER_PLAN[st.plan];
    const blocked = blockIfScheduled(st, ["packs"]);
    if (blocked) return blocked;

    const activeCount = await prisma.site.count({ where: { userId: user.id, locked: false } });
    const newLimit = getEffectiveSiteLimit(to, 0);
    const renew = st.periodEnd?.toISOString() ?? null;
    return NextResponse.json({
      action: "downgrade",
      amountDueToday: 0,
      amountDueTodayFormatted: "$0.00",
      nextRenewal: renew,
      nextRenewalFormatted: formatShortDate(renew),
      keepPlanUntil: planDisplayName(st.plan, st.packs),
      keepSiteLimitUntilRenewal: getEffectiveSiteLimit(st.plan, st.packs),
      newPlan: to,
      newPlanName: PLANS[to].name,
      newSiteLimitFromRenewal: newLimit,
      interval: st.interval,
      newRecurringMonthlyFormatted: formatPlanPrice(to, st.interval),
      activeCount,
      needsKeepPicker: activeCount > newLimit,
      maxKeep: newLimit,
    });
  });
}
