/**
 * A plan picked before checkout (pricing page → signup → verify → checkout, or /plan):
 * Starter, Pro, Business, or Custom (Business + blocks). Client-safe.
 */
import { CUSTOM_MAX_SITES, CUSTOM_MIN_SITES, blocksForSites, customSites, CUSTOM, PLANS } from "./plans";
import { formatPlanPrice, intervalParam, perMonthPrice, sizedPrice, type BillingInterval, type PaidPlanId } from "./billing-interval";

export type ChoiceId = "starter" | "pro" | "business" | "custom";
export type PlanChoice = { id: ChoiceId; blocks: number };

export const CHOICE_IDS: ChoiceId[] = ["starter", "pro", "business", "custom"];
/** Custom size shown first (slider default). */
export const DEFAULT_CUSTOM_SITES = 200;
export const TRIAL_DAYS = 30;

/** From query params: ?plan=starter|pro|business|custom&sites=200. Unknown → Starter. */
export function parseChoice(rawPlan: unknown, rawSites?: unknown): PlanChoice {
  const p = Array.isArray(rawPlan) ? rawPlan[0] : rawPlan;
  const s = Array.isArray(rawSites) ? rawSites[0] : rawSites;
  if (p === "custom") {
    const sites = Number(s) || DEFAULT_CUSTOM_SITES;
    return { id: "custom", blocks: Math.max(CUSTOM.minBlocks, blocksForSites(sites)) };
  }
  if (p === "pro" || p === "business") return { id: p, blocks: 0 };
  return { id: "starter", blocks: 0 };
}

export function choicePlan(c: PlanChoice): PaidPlanId {
  return c.id === "custom" ? "business" : c.id;
}

export function choiceBlocks(c: PlanChoice): number {
  return c.id === "custom" ? c.blocks : 0;
}

export function choiceSites(c: PlanChoice): number {
  return c.id === "custom" ? customSites(c.blocks) : PLANS[c.id].siteLimit;
}

export function choiceName(c: PlanChoice): string {
  return c.id === "custom" ? `Custom (${choiceSites(c)} sites)` : PLANS[c.id].name;
}

export function choicePrice(c: PlanChoice, interval: BillingInterval): number {
  return sizedPrice(choicePlan(c), choiceBlocks(c), interval);
}

export function choicePriceLabel(c: PlanChoice, interval: BillingInterval): string {
  return formatPlanPrice(choicePlan(c), interval, choiceBlocks(c));
}

/** Per-month equivalent ($4.17 for Starter annual). */
export function choicePerMonth(c: PlanChoice, interval: BillingInterval): string {
  const v = interval === "year" ? choicePrice(c, "year") / 12 : choicePrice(c, "month");
  return Number.isInteger(v) ? `$${v}` : `$${v.toFixed(2)}`;
}

export const hasTrial = (c: PlanChoice) => c.id === "starter";

/** Query string that carries the choice: plan=custom&sites=200&interval=annual */
export function choiceQuery(c: PlanChoice, interval: BillingInterval): string {
  const q = new URLSearchParams({ plan: c.id });
  if (c.id === "custom") q.set("sites", String(choiceSites(c)));
  q.set("interval", intervalParam(interval));
  return q.toString();
}

/** Body for POST /api/billing/checkout. */
export function checkoutBody(c: PlanChoice, interval: BillingInterval) {
  return { planId: choicePlan(c), blocks: choiceBlocks(c), interval: intervalParam(interval) };
}

export { CUSTOM_MIN_SITES, CUSTOM_MAX_SITES, perMonthPrice };
