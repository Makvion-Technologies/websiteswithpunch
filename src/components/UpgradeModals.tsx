"use client";

import { CheckoutPlanModal } from "@/components/CheckoutPlanModal";
import { UpgradePlanModal } from "@/components/UpgradePlanModal";
import type { PlanUpgrade } from "@/components/usePlanUpgrade";
import type { BillingInterval } from "@/lib/billing-interval";

/** Both upgrade windows driven by usePlanUpgrade(). */
export function UpgradeModals({
  upgrade: u,
  currentInterval,
  trialUsed,
}: {
  upgrade: PlanUpgrade;
  currentInterval?: BillingInterval | null;
  /** The account already had a Starter trial (no second one). */
  trialUsed?: boolean;
}) {
  return (
    <>
      <UpgradePlanModal
        open={u.upgradeTo !== null}
        targetPlan={u.upgradeTo ?? "business"}
        loading={u.loading !== null}
        message={u.message}
        currentInterval={currentInterval}
        onClose={() => u.setUpgradeTo(null)}
        onConfirm={(interval) => {
          if (u.upgradeTo) void u.checkout({ id: u.upgradeTo, blocks: 0 }, interval);
        }}
      />
      <CheckoutPlanModal
        choice={u.choice}
        loading={u.loading !== null}
        message={u.message}
        trialUsed={trialUsed}
        onChange={u.setChoice}
        onClose={() => u.setChoice(null)}
        onConfirm={(interval) => {
          if (u.choice) void u.checkout(u.choice, interval);
        }}
      />
    </>
  );
}
