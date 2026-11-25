"use client";

import { readJson } from "@/lib/read-json";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { getEffectivePlan, PLANS, type PlanId } from "@/lib/plans";
import { upgradeTargets } from "@/lib/upgrade-targets";
import type { BillingInterval, PaidPlanId } from "@/lib/billing-interval";
import { checkoutBody, choiceName, type PlanChoice } from "@/lib/plan-choice";
import { useToast } from "@/components/Toast";
import { PENDING_MESSAGE, STILL_PENDING_MESSAGE, awaitBilling } from "@/components/billing/awaitBilling";

/**
 * Upgrade state shared by the navbar, profile menu and /plan:
 * - startCheckout(choice) opens the plan window for a new subscription (no subscription yet)
 * - startUpgrade(plan) opens the in-place upgrade window (Starter → Pro / Business, Pro → Business)
 * Render both windows with <UpgradeModals upgrade={…} />.
 */
export function usePlanUpgrade(planOverride?: PlanId) {
  const { data: session, update } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [upgradeTo, setUpgradeToState] = useState<PaidPlanId | null>(null);
  const [choice, setChoiceState] = useState<PlanChoice | null>(null);

  const plan: PlanId | null =
    planOverride ??
    (session?.user ? getEffectivePlan(session.user.plan, session.user.dodoStatus ?? null) : null);

  function setUpgradeTo(target: PaidPlanId | null) {
    setMessage(null);
    setUpgradeToState(target);
  }

  function setChoice(next: PlanChoice | null) {
    setMessage(null);
    setChoiceState(next);
  }

  async function checkout(c: PlanChoice, interval: BillingInterval = "month") {
    const body = checkoutBody(c, interval);
    setLoading(c.id);
    setMessage(null);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await readJson(res);
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      if (data.ok) {
        setUpgradeToState(null);
        setChoiceState(null);
        const sameName = plan && plan !== "free" && body.planId === plan;
        const doneMsg = sameName ? "Switched to annual billing." : `You're on ${choiceName(c)} now.`;
        if (!data.pending) {
          toast(doneMsg, "success");
          void update(); // navbar plan comes from the session
          router.refresh();
          return;
        }
        toast(PENDING_MESSAGE, "info");
        const ok = await awaitBilling((s) => s.plan === body.planId && s.interval === interval);
        toast(ok ? doneMsg : STILL_PENDING_MESSAGE, ok ? "success" : "info");
        void update();
        router.refresh();
        return;
      }
      setMessage(data.error || "Checkout unavailable.");
    } catch {
      setMessage("Checkout failed. Try again in a moment.");
    } finally {
      setLoading(null);
    }
  }

  const targets = upgradeTargets(plan);
  return {
    plan,
    loading,
    message,
    upgradeTo,
    setUpgradeTo,
    choice,
    setChoice,
    /** New subscription: open the plan window (Monthly / Annual, Custom size). */
    startCheckout: (c: PlanChoice | PaidPlanId) => setChoice(typeof c === "string" ? { id: c, blocks: 0 } : c),
    /** Existing subscription: open the in-place upgrade window. */
    startUpgrade: (target: PaidPlanId) => setUpgradeTo(target),
    /** Right action for the current state: in-place upgrade when subscribed, else checkout. */
    upgrade: (target: PaidPlanId) =>
      plan && plan !== "free" ? setUpgradeTo(target) : setChoice({ id: target, blocks: 0 }),
    checkout,
    targets,
    showUpgrades: targets.length > 0,
    nameOf: (p: PaidPlanId) => PLANS[p].name,
  };
}

export type PlanUpgrade = ReturnType<typeof usePlanUpgrade>;
