"use client";

import { useState } from "react";
import { CUSTOM, LOWER_PLAN, PLANS, isPaidPlanId, planDisplayName } from "@/lib/plans";
import { useToast } from "@/components/Toast";
import { PlanSummaryCard } from "@/components/billing/PlanSummaryCard";
import { LimitBanners } from "@/components/billing/LimitBanners";
import { CancelPlanFlow } from "@/components/billing/CancelPlanFlow";
import { DowngradeFlow } from "@/components/billing/DowngradeFlow";
import { CustomSizeFlow } from "@/components/billing/CustomSizeFlow";
import { PendingKeepSitesFlow } from "@/components/billing/PendingKeepSitesFlow";
import { useBillingSummary } from "@/components/billing/useBillingSummary";
import { useBillingActions } from "@/components/billing/useBillingActions";
import { IntervalSwitchModals } from "@/components/billing/IntervalSwitchModals";
import { UpgradeModals } from "@/components/UpgradeModals";
import { usePlanUpgrade } from "@/components/usePlanUpgrade";
import { formatPlanPrice } from "@/lib/billing-interval";
import type { SiteCapacityProps } from "@/components/billing/types";

export type { SiteCapacityProps };

export function SiteCapacityActions({
  plan,
  sitePackCount,
  legacyFree = true,
  siteCount,
  siteLimit,
  atLimit,
  remaining,
  keepOptions,
  cancelAtPeriodEnd: cancelProp,
  pendingPlan: pendingPlanProp,
  billing,
}: SiteCapacityProps & { billing?: ReturnType<typeof useBillingSummary> }) {
  const { toast } = useToast();
  const paid = isPaidPlanId(plan) ? plan : null;
  // The page can share its summary (one /api/billing/summary request for the whole page).
  const own = useBillingSummary(Boolean(paid) && !billing, sitePackCount);
  const { summary, loadSummary } = billing ?? own;
  const blocks = summary?.sitePackCount ?? sitePackCount;
  const actions = useBillingActions({ plan, blocks, legacyFree, loadSummary, toast });
  const upgrade = usePlanUpgrade(plan);
  const [busy, setBusy] = useState(false);
  const [flow, setFlow] = useState<"cancel" | "downgrade" | "pending-keep" | "annual" | "monthly" | "resize" | null>(null);
  const interval = summary?.interval ?? "month";

  const hasPending = summary?.hasPendingRemoval ?? false;
  const pendingSites = summary?.pendingSitesToRemove ?? 0;
  const pendingDate = summary?.pendingPackChangeAtFormatted ?? null;
  const cancelAtPeriodEnd = summary?.cancelAtPeriodEnd ?? cancelProp ?? false;
  const pendingPlan = summary?.pendingPlan ?? pendingPlanProp ?? null;
  const pendingPlanDate = summary?.pendingPlanAtFormatted ?? null;
  const fallbackMax =
    pendingPlan === "free" ? (legacyFree ? 1 : 0) : isPaidPlanId(pendingPlan) ? PLANS[pendingPlan].siteLimit : siteLimit;
  const chooseMax = summary?.pendingTargetLimit ?? fallbackMax;
  const inTrial = Boolean(summary?.inTrial);
  const lower = paid && paid !== "starter" ? LOWER_PLAN[paid] : null;
  const higher = upgrade.targets[0] ?? null;

  async function run(fn: () => Promise<boolean | null | void>) {
    setBusy(true);
    try {
      return await fn();
    } finally {
      setBusy(false);
    }
  }

  // Cancel and downgrade always open a confirm window (the site picker is skipped when every
  // active site fits), so the no-refund terms are shown before anything changes.
  async function onDowngrade() {
    if ((await actions.previewNeedsKeepPicker()) !== null) setFlow("downgrade");
  }

  if (!paid) return null;

  return (
    <div className="space-y-3">
      <PlanSummaryCard
        plan={plan}
        effectivePacks={blocks}
        interval={interval}
        cancelAtPeriodEnd={cancelAtPeriodEnd}
        pendingPlan={pendingPlan}
        pendingPlanDate={pendingPlanDate}
        chooseMax={chooseMax}
        hasPendingRemoval={hasPending}
        pendingSites={pendingSites}
        pendingDate={pendingDate}
        loading={busy}
        inTrial={inTrial}
        onResize={paid === "business" ? () => setFlow("resize") : undefined}
        onUpgrade={higher ? () => upgrade.startUpgrade(higher) : undefined}
        onChooseActive={() => setFlow("pending-keep")}
        onResume={() => run(actions.resumePlan)}
        onUndoPack={() => run(actions.undoPendingRemoval)}
        onDowngrade={onDowngrade}
        onCancel={() => setFlow("cancel")}
        onSwitchAnnual={
          summary?.interval === "month" && !pendingPlan && !cancelAtPeriodEnd ? () => setFlow("annual") : undefined
        }
        onSwitchMonthly={
          summary?.interval === "year" && !summary.pendingInterval && !cancelAtPeriodEnd ? () => setFlow("monthly") : undefined
        }
        pendingMonthlyDate={summary?.pendingIntervalAtFormatted ?? null}
        pendingMonthlyPrice={summary?.pendingIntervalPriceFormatted ?? null}
        onKeepAnnual={() => run(actions.cancelMonthlySwitch)}
        packSlot={
          <LimitBanners
            plan={paid}
            blocks={blocks}
            atLimit={atLimit}
            remaining={remaining}
            loading={busy}
            onUpgrade={() => higher && upgrade.startUpgrade(higher)}
            onResize={() => setFlow("resize")}
          />
        }
      />
      <CancelPlanFlow
        open={flow === "cancel"}
        plan={plan}
        keepOptions={keepOptions}
        endsOn={summary?.trialEndsAtFormatted ?? summary?.nextPaymentDateFormatted ?? pendingDate}
        legacyFree={legacyFree}
        inTrial={inTrial}
        loading={busy}
        onClose={() => setFlow(null)}
        onConfirm={async (ids) => {
          await run(async () => {
            if (await actions.confirmCancel(ids)) setFlow(null);
          });
        }}
      />
      {lower && (
        <DowngradeFlow
          open={flow === "downgrade"}
          keepOptions={keepOptions}
          renewsOn={summary?.nextPaymentDateFormatted ?? null}
          newPrice={formatPlanPrice(lower, interval)}
          fromName={planDisplayName(paid, blocks)}
          toName={PLANS[lower].name}
          maxKeep={PLANS[lower].siteLimit}
          loading={busy}
          onClose={() => setFlow(null)}
          onConfirm={async (ids) => {
            await run(async () => {
              if (await actions.confirmDowngrade(ids)) setFlow(null);
            });
          }}
        />
      )}
      {paid === "business" && (
        <CustomSizeFlow
          open={flow === "resize"}
          currentBlocks={Math.min(blocks, CUSTOM.maxBlocks)}
          interval={interval}
          keepOptions={keepOptions}
          onClose={() => setFlow(null)}
          onConfirm={async (n, keep) => {
            const err = await actions.resize(n, keep);
            if (err === null) setFlow(null);
            return err ?? null;
          }}
        />
      )}
      <IntervalSwitchModals
        flow={flow === "annual" || flow === "monthly" ? flow : null}
        plan={paid}
        busy={busy}
        onClose={() => setFlow(null)}
        run={run}
        switchToAnnual={actions.switchToAnnual}
        scheduleMonthly={actions.scheduleMonthly}
      />
      <PendingKeepSitesFlow
        open={flow === "pending-keep"}
        maxKeep={Math.max(1, Math.min(chooseMax, keepOptions.length || 1))}
        keepOptions={keepOptions}
        loading={busy}
        onClose={() => setFlow(null)}
        onConfirm={async (ids) => {
          await run(async () => {
            if (await actions.confirmPendingKeep(ids)) setFlow(null);
          });
        }}
      />
      <UpgradeModals upgrade={upgrade} currentInterval={interval} />
    </div>
  );
}
