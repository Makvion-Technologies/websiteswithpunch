import { NextResponse } from "next/server";
import type DodoPayments from "dodopayments";
import type { User } from "@prisma/client";
import { CUSTOM, PLANS, clampBlocks, customSites, planDisplayName } from "@/lib/plans";
import { intervalLabel, parseInterval, type BillingInterval, type PaidPlanId } from "@/lib/billing-interval";
import { appUrl, dodoUserMessage, isDodoNotFound } from "@/lib/dodo";
import { logCatalogProblems } from "@/lib/dodo-catalog-check";
import { customerIdFor, retrieveOrRelink } from "@/lib/dodo-relink";
import { extraAddonIdFor, missingCatalogMessage, productIdFor } from "@/lib/dodo-products";
import { isPaidStatus, subscriptionState } from "@/lib/dodo-subscription";
import { applyChange, changeBody, upgradeMode } from "@/lib/dodo-change";
import { checkCustomCapacity } from "@/lib/monitor/capacity";
import { syncSubscription } from "@/lib/dodo-sync";
import { blockIfScheduled, fail, loadUser, ON_HOLD_ERROR } from "@/lib/billing-route";
import { isVerified } from "@/lib/email-verify";
import { addsBlocksInWrongCurrency, checkoutCurrencyOptions, CUSTOM_USD_ONLY_ERROR } from "@/lib/dodo-currency";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * No subscription → Dodo hosted checkout session (the webhook / return sync turns the plan on).
 * The Starter products carry the 30-day trial in Dodo (never passed here, so Prevent Trial
 * Misuse applies); Pro, Business and Custom are charged at checkout. Custom = Business + the
 * "Extra 25 sites" add-on with quantity `blocks`.
 * Existing subscriber (a bigger plan, or monthly → annual): Change Plan in place, charged now
 * with proration, or in full when it ends the Starter trial. Smaller plans and annual → monthly
 * are renewal-date bookings elsewhere; Custom size changes use /api/billing/resize.
 */
export async function POST(req: Request) {
  const loaded = await loadUser({ label: "checkout", rateKey: "checkout" });
  if (loaded instanceof NextResponse) return loaded;
  const { user, dodo } = loaded;
  if (!isVerified(user)) return fail(403, "Verify your email to continue.", "EMAIL_UNVERIFIED");

  const body = await req.json().catch(() => ({}));
  const planId: PaidPlanId =
    body?.planId === "business" ? "business" : body?.planId === "starter" ? "starter" : "pro";
  const interval = parseInterval(body?.interval);
  const blocks = planId === "business" ? clampBlocks(body?.blocks) : 0;

  if (user.dodoStatus === "on_hold") return fail(402, ON_HOLD_ERROR, "PAYMENT_FAILED");
  try {
    if (user.dodoSubscriptionId && isPaidStatus(user.dodoStatus)) {
      // No paid subscription in this Dodo mode (a test-mode leftover after going live):
      // start a real checkout; its webhook replaces the stale subscription on the user.
      const sub = await retrieveOrRelink(dodo, user);
      if (sub) return await changeInPlace(dodo, user, sub, planId, interval, blocks);
    }
    return await newCheckout(dodo, user, planId, interval, blocks);
  } catch (err) {
    console.error("billing checkout error", err);
    if (isDodoNotFound(err)) await logCatalogProblems(dodo, "checkout");
    return fail(502, dodoUserMessage(err, "Could not start checkout. Please try again."), "PAYMENT_FAILED");
  }
}

/** Over the Worker budget: Custom sizes pause until capacity is added (contact us instead). */
async function capacityBlock(blocks: number, currentBlocks = 0) {
  if (blocks <= currentBlocks) return null;
  const room = await checkCustomCapacity(blocks - currentBlocks);
  if (room.ok) return null;
  return fail(
    409,
    room.maxBlocks > currentBlocks
      ? `We can take Custom up to ${customSites(room.maxBlocks)} sites right now. Pick a smaller size or contact us.`
      : "Custom sizes are paused while we add monitoring capacity. Contact us and we'll set you up.",
    "CAPACITY",
    { maxSites: customSites(room.maxBlocks) },
  );
}

async function newCheckout(dodo: DodoPayments, user: User, planId: PaidPlanId, interval: BillingInterval, blocks: number) {
  const productId = productIdFor(planId, interval);
  if (!productId) return fail(503, missingCatalogMessage("plan", planId, interval), "PRICE_MISSING");
  const addonId = blocks > 0 ? extraAddonIdFor(interval) : null;
  if (blocks > 0 && !addonId) return fail(503, missingCatalogMessage("extra", "business", interval), "PRICE_MISSING");
  const full = await capacityBlock(blocks);
  if (full) return full;

  // Stored customer if Dodo knows it in this mode (a test-mode ID 404s in live), else by email / new.
  const customerId = (await customerIdFor(dodo, user, true))!;

  const session = await dodo.checkoutSessions.create({
    product_cart: [
      {
        product_id: productId,
        quantity: 1,
        ...(addonId ? { addons: [{ addon_id: addonId, quantity: blocks }] } : {}),
      },
    ],
    customer: { customer_id: customerId },
    // Dodo appends subscription_id and status; the dashboard syncs from them right away.
    return_url: `${appUrl()}/dashboard?checkout=done`,
    cancel_url: `${appUrl()}/dashboard?checkout=canceled`,
    metadata: { userId: user.id, planId, interval, blocks: String(blocks) },
    // INR for plain plans when DODO_LOCALIZED_PRICING=1; Custom (add-on blocks) always USD.
    ...checkoutCurrencyOptions(blocks),
  });
  if (!session.checkout_url) return fail(502, "Could not start checkout. Please try again.");
  return NextResponse.json({ url: session.checkout_url });
}

async function changeInPlace(
  dodo: DodoPayments,
  user: User,
  sub: DodoPayments.Subscription,
  planId: PaidPlanId,
  interval: BillingInterval,
  blocks: number,
) {
  const st = subscriptionState(sub);
  if (!st.plan || !isPaidStatus(st.status)) {
    return fail(409, "Your subscription isn't active. Refresh the page and try again.");
  }
  const RANK = { starter: 0, pro: 1, business: 2 } as const;
  const samePlan = st.plan === planId;
  // Interval switch keeps Custom blocks (at the booked lower count if a reduction is pending).
  const keepBlocks = st.scheduled ? st.scheduled.packs : st.packs;
  const target = planId === "business" ? (samePlan && blocks === 0 ? keepBlocks : blocks) : 0;
  if (samePlan && st.interval === interval) {
    // Dodo already has this plan but our copy lagged (missed webhook): mirror it and succeed.
    if (user.plan !== planId) {
      await syncSubscription(sub, { userId: user.id });
      return NextResponse.json({ ok: true, pending: false, plan: planId, interval, sitePackCount: st.packs });
    }
    if (planId === "business" && target !== st.packs) {
      return fail(400, "To change your Custom size, use Change size on your plan page.", "USE_RESIZE");
    }
    return fail(400, `You're already on ${planDisplayName(planId, st.packs)} with ${intervalLabel(interval).toLowerCase()} billing.`);
  }
  if (RANK[st.plan] > RANK[planId]) {
    return fail(400, `To move to ${PLANS[planId].name}, use Switch plan on your plan page (takes effect at renewal).`, "USE_DOWNGRADE");
  }
  if (st.interval === "year" && interval === "month") {
    return fail(400, "You're billed yearly, so plan changes stay on annual billing. Choose Annual.", "ANNUAL_ONLY");
  }
  const blocked = blockIfScheduled(st, ["packs"]);
  if (blocked) return blocked;
  if (addsBlocksInWrongCurrency(sub.currency, target, samePlan ? st.packs : 0)) {
    return fail(409, CUSTOM_USD_ONLY_ERROR, "CUSTOM_USD_ONLY");
  }
  const full = await capacityBlock(target, samePlan ? st.packs : 0);
  if (full) return full;
  if (target > CUSTOM.maxBlocks) return fail(400, "Custom goes up to 500 sites. Contact us for more.");

  // While the Starter trial runs, an upgrade ends it and charges the new plan in full today.
  const mode = upgradeMode(st);
  const built = changeBody({ plan: planId, interval, packs: target }, mode, st);
  if (!built.ok) return fail(503, built.error, "PRICE_MISSING");

  // Upgrading undoes a booked cancellation, as before.
  if (st.cancelAtPeriodEnd) {
    await dodo.subscriptions.update(sub.subscription_id, { cancel_at_next_billing_date: false });
  }
  const { applied } = await applyChange(
    dodo,
    sub.subscription_id,
    user.id,
    built.body,
    (f) => f.plan === planId && f.interval === interval && f.packs === target,
  );
  return NextResponse.json({ ok: true, pending: !applied, plan: planId, interval, sitePackCount: target, endedTrial: mode === "trial" });
}
