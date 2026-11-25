/**
 * Recurring totals from the catalog prices (plans.ts / billing-interval.ts), which match the
 * Dodo products 1:1. Client-safe. Dodo adds tax at checkout where it applies.
 * `blocks` = Custom extra 25-site blocks (Business only).
 */
import { CUSTOM, clampBlocks, isPaidPlanId, type PlanId } from "./plans";
import { blockPrice, planPrice, sizedPrice, type BillingInterval } from "./billing-interval";

function trimMoney(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(2);
}

/** Per-interval total in cents for a plan plus Custom blocks. */
export function recurringTotalCents(plan: PlanId, blocks: number, interval: BillingInterval = "month"): number {
  if (!isPaidPlanId(plan)) return 0;
  return sizedPrice(plan, blocks, interval) * 100;
}

/**
 * Plain-language recurring breakdown, e.g. "$12 Pro" or "$24 Business + $20 for 100 extra sites".
 */
export function recurringBreakdown(plan: PlanId, blocks: number, interval: BillingInterval = "month"): string {
  if (!isPaidPlanId(plan)) return "Free";
  const name = plan === "business" ? "Business" : plan === "pro" ? "Pro" : "Starter";
  const planPart = `$${trimMoney(planPrice(plan, interval))} ${name}`;
  const n = plan === "business" ? clampBlocks(blocks) : 0;
  if (n <= 0) return planPart;
  return `${planPart} + $${trimMoney(n * blockPrice(interval))} for ${n * CUSTOM.blockSites} extra sites`;
}
