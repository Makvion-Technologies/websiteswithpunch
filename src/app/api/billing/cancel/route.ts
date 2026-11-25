import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { PLANS } from "@/lib/plans";
import { setKeepOnDowngrade } from "@/lib/site-limits";
import { formatShortDate } from "@/lib/billing-format";
import { resync } from "@/lib/dodo-change";
import { fail, withSubscription } from "@/lib/billing-route";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({ keepSiteIds: z.array(z.string()).optional() });

/**
 * Cancel at the end of the paid period (Dodo cancel_at_next_billing_date). The plan stays
 * until then; nothing is refunded. Any booked change is dropped first: cancelling wins.
 * Accounts from before paid-only pricing (legacyFree) fall back to Free: keepSiteIds picks the
 * one site that stays. Newer accounts have no free fallback: monitoring pauses when the plan
 * ends (sites and history are kept), so no picker. During the Starter trial, cancelling means
 * the trial simply ends and nothing is ever charged.
 */
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  const keepSiteIds = parsed.success ? parsed.data.keepSiteIds ?? [] : [];

  return withSubscription({ label: "cancel" }, async ({ dodo, user, sub, st }) => {
    const freeLimit = user.legacyFree ? PLANS.free.siteLimit : 0;
    const activeCount = await prisma.site.count({ where: { userId: user.id, locked: false } });
    if (user.legacyFree && activeCount > freeLimit) {
      if (keepSiteIds.length !== freeLimit) {
        return fail(400, `Your Free plan includes ${freeLimit} site. Choose which one stays active.`, "KEEP_REQUIRED", {
          maxKeep: freeLimit,
          activeCount,
        });
      }
      const keep = await setKeepOnDowngrade(user.id, keepSiteIds, freeLimit);
      if (!keep.ok) return NextResponse.json(keep, { status: 400 });
    }

    if (st.scheduled) await dodo.subscriptions.cancelChangePlan(sub.subscription_id);
    await dodo.subscriptions.update(sub.subscription_id, { cancel_at_next_billing_date: true });
    const fresh = await resync(dodo, sub.subscription_id, user.id);
    const at = fresh.next_billing_date ? new Date(fresh.next_billing_date) : st.periodEnd;

    return NextResponse.json({
      ok: true,
      pendingPlan: "free",
      pendingPlanAt: at?.toISOString() ?? null,
      pendingPlanAtFormatted: formatShortDate(at),
      keepLimit: freeLimit,
      legacyFree: user.legacyFree,
      inTrial: Boolean(st.trialEndsAt),
    });
  });
}
