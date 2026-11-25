/** Client-safe billing interval helpers (no env or SDK imports). */
import { CUSTOM, PLANS, clampBlocks } from "./plans";

export type BillingInterval = "month" | "year";
export type PaidPlanId = "starter" | "pro" | "business";

/** Annual = 2 months free (10 × the monthly price). */
export const ANNUAL_PRICES = { starter: 50, pro: 120, business: 240 } as const;
/** One Custom block (+25 sites): $5/month or $50/year (same 2-months-free rule). */
export const ANNUAL_BLOCK_PRICE = 50;

/** Accepts "annual" / "year" / "yearly" (query strings, bodies); anything else is monthly. */
export function parseInterval(raw: unknown): BillingInterval {
  const v = Array.isArray(raw) ? raw[0] : raw;
  return v === "annual" || v === "year" || v === "yearly" ? "year" : "month";
}

/** Value used in URLs: /signup?plan=pro&interval=annual */
export function intervalParam(interval: BillingInterval): "annual" | "monthly" {
  return interval === "year" ? "annual" : "monthly";
}

export function intervalLabel(interval: BillingInterval): "Annual" | "Monthly" {
  return interval === "year" ? "Annual" : "Monthly";
}

export function periodWord(interval: BillingInterval): "year" | "month" {
  return interval === "year" ? "year" : "month";
}

/** Whole-period plan price in dollars ($12 monthly, $120 yearly). */
export function planPrice(plan: PaidPlanId, interval: BillingInterval): number {
  return interval === "year" ? ANNUAL_PRICES[plan] : PLANS[plan].price;
}

/** Whole-period price of one Custom block in dollars ($5 monthly, $50 yearly). */
export function blockPrice(interval: BillingInterval): number {
  return interval === "year" ? ANNUAL_BLOCK_PRICE : CUSTOM.blockPrice;
}

/** Whole-period price of Business + blocks (Custom when blocks > 0). */
export function sizedPrice(plan: PaidPlanId, blocks: number, interval: BillingInterval): number {
  if (plan !== "business") return planPrice(plan, interval);
  return planPrice("business", interval) + clampBlocks(blocks) * blockPrice(interval);
}

/** What the plan costs per month on this interval ($10 for Pro annual). */
export function perMonthPrice(plan: PaidPlanId, interval: BillingInterval): number {
  return interval === "year" ? ANNUAL_PRICES[plan] / 12 : PLANS[plan].price;
}

/** "$120/year" or "$12/month". */
export function formatPlanPrice(plan: PaidPlanId, interval: BillingInterval, blocks = 0): string {
  return `$${sizedPrice(plan, blocks, interval)}/${periodWord(interval)}`;
}
