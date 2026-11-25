/**
 * Plan / size / interval changes on the one Dodo subscription (Change Plan API).
 * - Upgrades and bigger Custom sizes apply now: `prorated_immediately` credits the unused part
 *   of the current cycle and charges the new cycle (Dodo starts a new cycle on the change date).
 *   `prevent_change` keeps the current plan if that charge fails, so nothing is lost.
 * - Upgrading out of the Starter free trial ("trial" below) uses `full_immediately`: the trial
 *   ends and the full new price is charged today (the $0 trial has nothing to credit, and
 *   `do_not_bill` would keep the trial running). `prevent_change` keeps the trial if it fails.
 * - Downgrades, smaller Custom sizes and annual → monthly are booked for the renewal date
 *   (`next_billing_date`, which Dodo requires to pair with `full_immediately`): nothing is
 *   charged, refunded or credited now; the renewal bills the new plan in full.
 * A Dodo subscription holds one booked change, so a new booking replaces the old one.
 * `packs` in ChangeTarget = Custom extra 25-site blocks (Business only).
 */
import type DodoPayments from "dodopayments";
import type { BillingInterval, PaidPlanId } from "./billing-interval";
import { extraAddonIdFor, missingCatalogMessage, productIdFor } from "./dodo-products";
import { subscriptionState, type SubscriptionState } from "./dodo-subscription";
import { syncSubscription } from "./dodo-sync";

export type ChangeTarget = { plan: PaidPlanId; interval: BillingInterval; packs: number };
type ChangeBody = DodoPayments.SubscriptionChangePlanParams;

/** Change Plan body for a target, or a config error naming the missing env var. */
export function changeBody(
  target: ChangeTarget,
  when: "now" | "renewal" | "trial",
  st: SubscriptionState,
): { ok: true; body: ChangeBody } | { ok: false; error: string } {
  const productId = productIdFor(target.plan, target.interval);
  if (!productId) return { ok: false, error: missingCatalogMessage("plan", target.plan, target.interval) };
  const addons: ChangeBody["addons"] = [];
  if (target.plan === "business" && target.packs > 0) {
    const addonId = extraAddonIdFor(target.interval);
    if (!addonId) return { ok: false, error: missingCatalogMessage("extra", target.plan, target.interval) };
    addons.push({ addon_id: addonId, quantity: target.packs });
  }
  const body: ChangeBody = {
    product_id: productId,
    quantity: 1,
    addons, // always sent: an omitted list would drop existing add-ons
    ...(when === "now"
      ? {
          proration_billing_mode: "prorated_immediately",
          effective_at: "immediately",
          on_payment_failure: "prevent_change",
        }
      : when === "trial"
        ? // Ends the free trial: full new price today, new cycle from today, trial kept on failure.
          { proration_billing_mode: "full_immediately", effective_at: "immediately", on_payment_failure: "prevent_change" }
        : // Dodo only accepts full_immediately with next_billing_date. A booked change charges
          // nothing now; at renewal the subscription simply bills the new plan in full.
          { proration_billing_mode: "full_immediately", effective_at: "next_billing_date" }),
    ...(st.scheduled ? { cancel_scheduled_change_plan: true } : {}),
  };
  return { ok: true, body };
}

/** "now", or "trial" while the Starter free trial runs (upgrades then end the trial). */
export function upgradeMode(st: Pick<SubscriptionState, "trialEndsAt">): "now" | "trial" {
  return st.trialEndsAt ? "trial" : "now";
}

/** Preview body: the same request minus fields the preview route ignores. */
export function previewBody(body: ChangeBody): DodoPayments.SubscriptionPreviewChangePlanParams {
  const { product_id, quantity, addons, proration_billing_mode, effective_at, on_payment_failure } = body;
  return { product_id, quantity, addons, proration_billing_mode, effective_at, on_payment_failure };
}

/**
 * Send the change, re-read the subscription and mirror it. `applied` is false while Dodo is
 * still confirming the charge (usually under two minutes); the webhook finishes the job.
 */
export async function applyChange(
  dodo: DodoPayments,
  subscriptionId: string,
  userId: string,
  body: ChangeBody,
  isApplied: (fresh: SubscriptionState) => boolean,
): Promise<{ applied: boolean; fresh: SubscriptionState }> {
  await dodo.subscriptions.changePlan(subscriptionId, body);
  const fresh = subscriptionState(await resync(dodo, subscriptionId, userId));
  return { applied: isApplied(fresh), fresh };
}

/** Re-read and mirror after a change that has no charge (cancel, resume, bookings). */
export async function resync(dodo: DodoPayments, subscriptionId: string, userId: string) {
  const sub = await dodo.subscriptions.retrieve(subscriptionId);
  await syncSubscription(sub, { userId });
  return sub;
}
