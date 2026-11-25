import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getEffectiveSiteLimit, LOWER_PLAN, PLANS, planDisplayName } from "@/lib/plans";
import { formatPlanPrice, planPrice } from "@/lib/billing-interval";
import { formatShortDate } from "@/lib/billing-format";
import { setKeepOnDowngrade } from "@/lib/site-limits";
import { changeBody, resync } from "@/lib/dodo-change";
import { blockIfScheduled, fail, withSubscription } from "@/lib/billing-route";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({ keepSiteIds: z.array(z.string()).optional() });

/**
 * Book one tier down for the renewal date, same interval, Custom blocks dropped
 * (Change Plan, next_billing_date, full_immediately). The current limits stay until then.
 */
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  const keepSiteIds = parsed.success ? parsed.data.keepSiteIds ?? [] : [];

  return withSubscription({ label: "downgrade" }, async ({ dodo, user, sub, st }) => {
    if (st.plan === "starter") return fail(400, "Starter is the smallest plan. You can cancel instead.");
    const to = LOWER_PLAN[st.plan];
    const toName = PLANS[to].name;
    const blocked = blockIfScheduled(st, ["packs"]);
    if (blocked) return blocked;
    const built = changeBody({ plan: to, interval: st.interval, packs: 0 }, "renewal", st);
    if (!built.ok) return fail(503, built.error, "PRICE_MISSING");

    const newLimit = getEffectiveSiteLimit(to, 0);
    const activeCount = await prisma.site.count({ where: { userId: user.id, locked: false } });
    if (activeCount > newLimit) {
      if (keepSiteIds.length !== newLimit) {
        return fail(400, `Your ${toName} plan includes ${newLimit} sites. Choose which ones stay active.`, "KEEP_REQUIRED", {
          maxKeep: newLimit,
          activeCount,
        });
      }
      const keep = await setKeepOnDowngrade(user.id, keepSiteIds, newLimit);
      if (!keep.ok) return NextResponse.json(keep, { status: 400 });
    }

    await dodo.subscriptions.changePlan(sub.subscription_id, built.body);
    await resync(dodo, sub.subscription_id, user.id);

    const at = st.periodEnd;
    return NextResponse.json({
      ok: true,
      pendingPlan: to,
      fromName: planDisplayName(st.plan, st.packs),
      toName,
      pendingPlanAt: at?.toISOString() ?? null,
      pendingPlanAtFormatted: formatShortDate(at),
      keepLimitUntil: getEffectiveSiteLimit(st.plan, st.packs),
      newLimitFrom: newLimit,
      interval: st.interval,
      newMonthly: planPrice(to, st.interval),
      newRecurringFormatted: formatPlanPrice(to, st.interval),
    });
  });
}
