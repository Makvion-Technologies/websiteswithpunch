import { NextResponse } from "next/server";
import { PLANS, planDisplayName } from "@/lib/plans";
import { parseInterval, sizedPrice, type PaidPlanId } from "@/lib/billing-interval";
import { daysLeftInPeriod } from "@/lib/dodo-subscription";
import { changeBody, previewBody, upgradeMode } from "@/lib/dodo-change";
import { blockIfScheduled, fail, withSubscription } from "@/lib/billing-route";
import { formatChargeToday, formatRecurringFromCents, formatShortDate } from "@/lib/billing-format";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Preview an in-place upgrade (a bigger plan, or monthly → annual) with Dodo's own numbers.
 * During the Starter trial the preview uses the trial-ending mode (full price today).
 */
export async function GET(req: Request) {
  const params = new URL(req.url).searchParams;
  return previewPlan(params.get("planId"), params.get("interval"));
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  return previewPlan(body?.planId, body?.interval);
}

function previewPlan(rawPlan: unknown, rawInterval: unknown) {
  const targetPlan: PaidPlanId = rawPlan === "pro" ? "pro" : rawPlan === "starter" ? "starter" : "business";
  const interval = parseInterval(rawInterval);
  return withSubscription({ label: "preview-plan" }, async ({ dodo, sub, st }) => {
    if (st.plan === targetPlan && st.interval === interval) {
      return fail(400, `You're already on ${PLANS[targetPlan].name} with this billing.`);
    }
    const RANK = { starter: 0, pro: 1, business: 2 } as const;
    if (RANK[st.plan] > RANK[targetPlan]) {
      return fail(400, `To move to ${PLANS[targetPlan].name}, use Switch plan in Your plan (takes effect at renewal).`, "USE_DOWNGRADE");
    }
    if (st.interval === "year" && interval === "month") {
      return fail(400, "You're billed yearly, so plan changes stay on annual billing. Choose Annual.", "ANNUAL_ONLY");
    }
    const blocked = blockIfScheduled(st, ["packs"]);
    if (blocked) return blocked;

    const samePlan = st.plan === targetPlan;
    const keptPacks = samePlan ? (st.scheduled ? st.scheduled.packs : st.packs) : 0;
    const mode = upgradeMode(st);
    const built = changeBody({ plan: targetPlan, interval, packs: keptPacks }, mode, st);
    if (!built.ok) return fail(503, built.error, "PRICE_MISSING");

    const preview = await dodo.subscriptions.previewChangePlan(sub.subscription_id, previewBody(built.body));
    const amountDueToday = preview.immediate_charge.summary.total_amount;
    const taxToday = preview.immediate_charge.summary.tax ?? 0;
    const currency = preview.immediate_charge.summary.currency || sub.currency || "USD";
    const nextRenewal = preview.new_plan.next_billing_date || null;
    const newRecurringCents = sizedPrice(targetPlan, keptPacks, interval) * 100;

    return NextResponse.json({
      currentPlan: st.plan,
      currentPlanName: planDisplayName(st.plan, st.packs),
      currentInterval: st.interval,
      targetPlan,
      targetPlanName: PLANS[targetPlan].name,
      interval,
      samePlan,
      intervalChanges: st.interval !== interval,
      keptPacks,
      endsTrial: mode === "trial",
      trialEndsAtFormatted: formatShortDate(st.trialEndsAt?.toISOString() ?? null),
      amountDueToday,
      amountDueTodayFormatted: formatChargeToday(amountDueToday, currency),
      taxTodayFormatted: taxToday > 0 ? formatChargeToday(taxToday, currency) : null,
      daysLeftInPeriod: daysLeftInPeriod(st),
      nextRenewal,
      nextRenewalFormatted: formatShortDate(nextRenewal),
      newRecurringMonthlyCents: newRecurringCents,
      newRecurringMonthlyFormatted: formatRecurringFromCents(newRecurringCents, "usd", interval),
      currency,
    });
  });
}
