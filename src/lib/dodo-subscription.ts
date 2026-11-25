/**
 * Pure helpers over a Dodo subscription (API response or webhook `data`). One subscription
 * per customer: the plan is the product, Custom's extra 25-site blocks ("packs" below) are the
 * "Extra 25 sites" add-on's quantity on Business, and a change booked for the renewal date shows
 * up as `scheduled_change`. Retired pack add-ons are ignored: the new plan sizes include them.
 */
import { clampBlocks, type PlanId } from "./plans";
import type { BillingInterval, PaidPlanId } from "./billing-interval";
import { lookupCatalogId } from "./dodo-products";

type AddonQty = { addon_id: string; quantity: number };

/** The fields we read; the SDK's Subscription type satisfies it. */
export type SubLike = {
  subscription_id: string;
  status: string;
  product_id: string;
  addons?: AddonQty[] | null;
  cancel_at_next_billing_date?: boolean | null;
  next_billing_date?: string | null;
  payment_frequency_interval?: string | null;
  customer?: { customer_id: string; email?: string | null } | null;
  created_at?: string | null;
  /** Days of free trial on this subscription (0 when none, or once a plan change ended it). */
  trial_period_days?: number | null;
  metadata?: Record<string, unknown> | null;
  scheduled_change?: {
    product_id: string;
    effective_at: string;
    addons?: AddonQty[] | null;
  } | null;
};

/** Statuses that keep the paid plan: active, and past_due (Dodo's grace period). */
export const PAID_STATUSES = new Set(["active", "past_due"]);
/** Subscriptions that can never come back; the customer has to subscribe again. */
export const ENDED_STATUSES = new Set(["cancelled", "expired", "failed"]);

export function isPaidStatus(status: string | null | undefined): boolean {
  return Boolean(status && PAID_STATUSES.has(status));
}

/** Plan + interval of a product ID; interval falls back to the subscription's frequency. */
function planOfProduct(
  productId: string,
  frequency?: string | null,
): { plan: PaidPlanId; interval: BillingInterval } | null {
  const info = lookupCatalogId(productId);
  if (info?.kind === "plan") return { plan: info.plan, interval: info.interval };
  if (!info) return null;
  return { plan: info.plan, interval: frequency === "Year" ? "year" : "month" };
}

/** Custom block quantity ("Extra 25 sites" add-on) on Business; 0 for other plans. */
export function packCountOf(addons: AddonQty[] | null | undefined, plan: PlanId): number {
  if (plan !== "business") return 0;
  let qty = 0;
  for (const a of addons ?? []) {
    if (lookupCatalogId(a.addon_id)?.kind === "extra") qty += a.quantity;
  }
  return clampBlocks(qty);
}

/** True when the subscription still carries a retired product or site-pack add-on. */
export function hasLegacyItems(sub: Pick<SubLike, "product_id" | "addons">): boolean {
  if (lookupCatalogId(sub.product_id)?.legacy) return true;
  return (sub.addons ?? []).some((a) => lookupCatalogId(a.addon_id)?.kind === "legacy-pack");
}

/**
 * End of the free trial while one is running, else null. Dodo has no trial-status field: a
 * subscription with trial days starts with a $0 authorisation and first bills at
 * created_at + trial days; a plan change that ends the trial sets trial_period_days to 0.
 */
export function trialEndOf(sub: Pick<SubLike, "trial_period_days" | "created_at" | "status">, nowMs = Date.now()): Date | null {
  const days = Number(sub.trial_period_days ?? 0);
  if (!(days > 0) || !sub.created_at) return null;
  if (sub.status !== "active" && sub.status !== "past_due") return null;
  const start = new Date(sub.created_at).getTime();
  if (Number.isNaN(start)) return null;
  const end = start + days * 86400000;
  return end > nowMs ? new Date(end) : null;
}

export type ScheduledState = {
  plan: PaidPlanId;
  interval: BillingInterval;
  packs: number;
  at: Date;
};

export type SubscriptionState = {
  status: string;
  /** null when the product is not one of ours (unknown env / other brand). */
  plan: PaidPlanId | null;
  interval: BillingInterval;
  packs: number;
  cancelAtPeriodEnd: boolean;
  /** End of the paid period (= next billing date). */
  periodEnd: Date | null;
  scheduled: ScheduledState | null;
  /** Free-trial end while the trial runs (Starter only), else null. */
  trialEndsAt: Date | null;
};

function toDate(iso: string | null | undefined): Date | null {
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function subscriptionState(sub: SubLike): SubscriptionState {
  const current = planOfProduct(sub.product_id, sub.payment_frequency_interval);
  const plan = current?.plan ?? null;
  let scheduled: ScheduledState | null = null;
  const sc = sub.scheduled_change;
  const target = sc ? planOfProduct(sc.product_id) : null;
  const at = sc ? toDate(sc.effective_at) : null;
  if (sc && target && at) {
    scheduled = { ...target, packs: packCountOf(sc.addons, target.plan), at };
  }
  return {
    status: sub.status,
    plan,
    interval: current?.interval ?? "month",
    packs: plan ? packCountOf(sub.addons, plan) : 0,
    cancelAtPeriodEnd: Boolean(sub.cancel_at_next_billing_date),
    periodEnd: toDate(sub.next_billing_date),
    scheduled,
    trialEndsAt: trialEndOf(sub),
  };
}

/** What a scheduled change does, for messages and guards. */
export function scheduledKind(
  s: SubscriptionState,
): "none" | "interval" | "downgrade" | "packs" {
  const sc = s.scheduled;
  if (!sc) return "none";
  if (sc.interval !== s.interval) return "interval";
  if (sc.plan !== s.plan) return "downgrade";
  return "packs";
}

export function daysLeftInPeriod(s: SubscriptionState, nowMs = Date.now()): number | null {
  if (!s.periodEnd) return null;
  const ms = s.periodEnd.getTime() - nowMs;
  return ms <= 0 ? 0 : Math.ceil(ms / 86400000);
}
