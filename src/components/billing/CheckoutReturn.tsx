"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getEffectiveSiteLimit, planDisplayName, type PlanId } from "@/lib/plans";
import { RECEIPT_NOTE } from "@/lib/tax-copy";
import { STILL_PENDING_MESSAGE, awaitBilling } from "@/components/billing/awaitBilling";

const box = "mt-6 rounded-none border px-4 py-3 text-sm";
const ok = `${box} border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-400/30 dark:bg-emerald-400/10 dark:text-emerald-200`;
const warn = `${box} border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-200`;

/**
 * Banner after returning from Dodo checkout (/dashboard?checkout=done&subscription_id=…&status=…).
 * Re-reads the subscription from Dodo until the paid plan is on (the webhook does the same),
 * then refreshes the page so limits and buttons update.
 */
export function CheckoutReturn({
  outcome,
  subscriptionId,
  status,
  plan,
  blocks = 0,
}: {
  outcome: string;
  subscriptionId?: string;
  status?: string;
  plan: PlanId;
  /** Custom extra 25-site blocks already on the account. */
  blocks?: number;
}) {
  const router = useRouter();
  const failed = outcome === "canceled" || status === "failed" || status === "cancelled";
  const [state, setState] = useState<"waiting" | "done" | "slow">(plan !== "free" ? "done" : "waiting");
  const [newPlan, setNewPlan] = useState<PlanId>(plan);
  const [newBlocks, setNewBlocks] = useState(blocks);

  useEffect(() => {
    if (failed || state !== "waiting") return;
    let live = true;
    void awaitBilling(
      (s) => {
        if (s.plan === "free") return false;
        if (live) {
          setNewPlan(s.plan);
          setNewBlocks(s.sitePackCount ?? 0);
        }
        return true;
      },
      { subscriptionId, tries: 30, everyMs: 3000 },
    ).then((done) => {
      if (!live) return;
      setState(done ? "done" : "slow");
      if (done) router.refresh();
    });
    return () => {
      live = false;
    };
  }, [failed, state, subscriptionId, router]);

  if (failed) {
    return (
      <div className={warn} role="status">
        Checkout didn&apos;t finish, so nothing was charged. You can pick a plan anytime from Your plan.
      </div>
    );
  }
  if (state === "done" && newPlan !== "free") {
    return (
      <div className={ok} role="status">
        Confirmed. You&apos;re on {planDisplayName(newPlan, newBlocks, false)}: up to{" "}
        {getEffectiveSiteLimit(newPlan, newBlocks, false)} sites are ready to monitor. {RECEIPT_NOTE}
      </div>
    );
  }
  return (
    <div className={warn} role="status" aria-live="polite">
      {state === "slow"
        ? STILL_PENDING_MESSAGE
        : `Thanks! Confirming your checkout with Dodo Payments. Your plan switches on automatically, usually within a minute. ${RECEIPT_NOTE}`}
    </div>
  );
}
