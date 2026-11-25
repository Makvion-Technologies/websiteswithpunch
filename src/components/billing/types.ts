import type { PlanId } from "@/lib/plans";
import type { KeepSiteOption } from "@/components/KeepSitesPicker";
import type { BillingInterval } from "@/lib/billing-interval";

export type BillingSummary = {
  /** True when this request found our copy out of date and re-synced it from Dodo. */
  healed?: boolean;
  plan: PlanId;
  planName: string;
  /** Account from before paid-only pricing ("free" = the 1-site Free plan for life). */
  legacyFree?: boolean;
  /** Starter free trial running (ends trialEndsAt; first charge then). */
  inTrial?: boolean;
  trialEndsAtFormatted?: string | null;
  /** null on Free. */
  interval?: BillingInterval | null;
  intervalLabel?: string | null;
  /** "month" while an annual → monthly switch is scheduled for renewal. */
  pendingInterval?: "month" | null;
  pendingIntervalAtFormatted?: string | null;
  pendingIntervalPriceFormatted?: string | null;
  sitePackCount: number;
  siteLimit: number;
  /** Today's per-period total (current plan + packs). */
  monthlyTotalFormatted: string;
  /** What the next renewal bills, after any booked change. */
  nextTotalFormatted?: string | null;
  nextAmountFormatted?: string | null;
  /** True when the next renewal differs from today's total (a change is booked). */
  nextChanges?: boolean;
  nextPaymentDateFormatted: string | null;
  hasPendingRemoval: boolean;
  pendingSitesToRemove: number;
  pendingPackChangeAtFormatted: string | null;
  cancelAtPeriodEnd?: boolean;
  pendingPlan?: string | null;
  pendingPlanAtFormatted?: string | null;
  pendingTargetLimit?: number | null;
  paymentFailed?: boolean;
};

export type SiteCapacityProps = {
  plan: PlanId;
  sitePackCount: number;
  legacyFree?: boolean;
  siteCount: number;
  siteLimit: number;
  atLimit: boolean;
  remaining: number;
  keepOptions: KeepSiteOption[];
  cancelAtPeriodEnd?: boolean;
  pendingPlan?: string | null;
  pendingPlanAt?: string | null;
};

/** GET /api/billing/resize?blocks=N response. */
export type ResizePreview = {
  action: "increase" | "decrease" | "undo";
  blocks: number;
  sites: number;
  name: string;
  currentSites: number;
  interval: BillingInterval;
  activeCount: number;
  amountDueTodayFormatted: string;
  taxTodayFormatted?: string | null;
  newRecurringFormatted: string;
  recurringBreakdown: string;
  nextRenewalFormatted?: string | null;
  effectiveAtFormatted?: string | null;
  needsKeepPicker?: boolean;
  maxKeep?: number;
};
