"use client";

import Link from "next/link";
import { useBillingSummary } from "@/components/billing/useBillingSummary";
import { PLANS, type PlanId } from "@/lib/plans";

/**
 * Compact notices, managed on /plan: no plan yet (monitoring paused), free trial end date, and a
 * booked cancel / downgrade / smaller Custom size.
 */
export function DashboardPendingBanner({ plan, sitePackCount }: { plan: PlanId; sitePackCount: number }) {
  const { summary } = useBillingSummary(true, sitePackCount);
  if (!summary) return null;

  if (plan === "free") {
    if (summary.legacyFree !== false) return null;
    return (
      <div className="mt-6 border border-accent/30 bg-accent-soft px-4 py-3 text-sm text-ink">
        <p className="font-medium">Choose a plan to start monitoring.</p>
        <p className="mt-1 text-muted">
          Your account is ready, but checks and alerts are paused until you pick a plan. Starter
          ($5/month, 10 sites) comes with a 30-day free trial.
        </p>
        <Link href="/plan" className="mt-3 inline-block bg-accent px-4 py-2 font-medium text-white hover:bg-accent-hover">
          See plans
        </Link>
      </div>
    );
  }

  const lines: string[] = [];
  if (summary.cancelAtPeriodEnd && summary.pendingPlanAtFormatted) {
    lines.push(summary.inTrial ? `Your free trial ends on ${summary.pendingPlanAtFormatted}.` : `Your plan ends on ${summary.pendingPlanAtFormatted}.`);
  } else if ((summary.pendingPlan === "pro" || summary.pendingPlan === "starter") && summary.pendingPlanAtFormatted) {
    lines.push(`Switching to ${PLANS[summary.pendingPlan].name} on ${summary.pendingPlanAtFormatted}.`);
  } else if (summary.inTrial && summary.trialEndsAtFormatted) {
    return (
      <div className="mt-6 border border-accent/30 bg-accent-soft px-4 py-3 text-sm text-ink">
        Free trial until {summary.trialEndsAtFormatted}. Your first payment of {summary.nextAmountFormatted ?? "the Starter price"} is on that date.{" "}
        <Link href="/plan" className="font-medium underline underline-offset-2">
          Manage
        </Link>
      </div>
    );
  }
  if (summary.hasPendingRemoval && summary.pendingPackChangeAtFormatted) {
    lines.push(
      `${summary.pendingSitesToRemove} site${summary.pendingSitesToRemove === 1 ? "" : "s"} will be locked on ${summary.pendingPackChangeAtFormatted}.`,
    );
  }
  if (!lines.length) return null;

  return (
    <div className="mt-6 rounded-none border border-amber-300 bg-amber-50 dark:border-amber-400/30 dark:bg-amber-400/10 px-4 py-3 text-sm text-amber-950 dark:text-amber-100">
      <p>{lines.join(" ")}</p>
      <Link href="/plan" className="mt-2 inline-block font-medium underline underline-offset-2">
        Manage on My Plan
      </Link>
    </div>
  );
}
