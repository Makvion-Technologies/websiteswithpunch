/**
 * Plan mix, segments and revenue estimate for the admin panel. Pure: callers pass user rows.
 *
 * Paid-only pricing: Starter (30-day card-required trial), Pro, Business, Custom (Business +
 * extra 25-site blocks in sitePackCount). Accounts from before paid-only pricing keep Free for
 * life (legacyFree); newer accounts without a subscription have no plan. A Starter trial is
 * keyed on our own trial fields (trialEndsAt in the future and no trialConvertedAt), not on a
 * Dodo status: Dodo reports a running trial as "active".
 */
import { CUSTOM, PLANS, isPaidPlanId } from "@/lib/plans";
import { CHECK_EVERY_MIN, CUSTOM_EXTRA_EVERY_MIN } from "@/lib/monitor/config";

export type Segment = "paid" | "trial" | "at-risk" | "legacy-free" | "no-plan";
export const SEGMENT_LABEL: Record<Segment, string> = {
  paid: "Paying",
  trial: "On trial",
  "at-risk": "Payment issue",
  "legacy-free": "Legacy Free",
  "no-plan": "No plan",
};

export type PlanBucket = "starter-trial" | "starter" | "pro" | "business" | "custom" | "legacy-free" | "no-plan";
export const PLAN_BUCKETS: PlanBucket[] = ["starter-trial", "starter", "pro", "business", "custom", "legacy-free", "no-plan"];
export const PLAN_BUCKET_LABEL: Record<PlanBucket, string> = {
  "starter-trial": "Starter (on trial)",
  starter: "Starter",
  pro: "Pro",
  business: "Business",
  custom: "Custom",
  "legacy-free": "Legacy Free",
  "no-plan": "No plan",
};
/** /admin/users?plan=… filter for each bucket. */
export const PLAN_BUCKET_FILTER: Record<PlanBucket, string> = {
  "starter-trial": "trial",
  starter: "starter",
  pro: "pro",
  business: "business",
  custom: "custom",
  "legacy-free": "legacy",
  "no-plan": "noplan",
};

const ENDED = ["cancelled", "expired", "failed"];
export type Row = {
  plan: string;
  dodoStatus: string | null;
  sitePackCount?: number | null;
  /** Missing = an account from before the flag (treated as legacy Free, like the DB default). */
  legacyFree?: boolean | null;
  trialEndsAt?: Date | string | null;
  trialConvertedAt?: Date | string | null;
};

const ms = (d: Date | string | null | undefined) => (d ? new Date(d).getTime() : 0);
const hasSubscription = (u: Row) => isPaidPlanId(u.plan) && !ENDED.includes(u.dodoStatus ?? "");

/** Starter trial running now: an end date ahead and not converted (or ended by an upgrade). */
export function inTrial(u: Row, now = Date.now()): boolean {
  return hasSubscription(u) && !u.trialConvertedAt && ms(u.trialEndsAt) > now;
}

export function segmentOf(u: Row, now = Date.now()): Segment {
  if (!hasSubscription(u)) return u.legacyFree === false ? "no-plan" : "legacy-free";
  if (u.dodoStatus === "past_due" || u.dodoStatus === "on_hold") return "at-risk";
  if (inTrial(u, now)) return "trial";
  return "paid";
}

export function planBucketOf(u: Row, now = Date.now()): PlanBucket {
  if (!hasSubscription(u)) return u.legacyFree === false ? "no-plan" : "legacy-free";
  if (u.plan === "business") return (u.sitePackCount ?? 0) > 0 ? "custom" : "business";
  if (u.plan === "starter") return inTrial(u, now) ? "starter-trial" : "starter";
  return u.plan as PlanBucket;
}

export function planPrice(plan: string): number {
  return (PLANS as Record<string, { price: number }>)[plan]?.price ?? 0;
}

/**
 * Monthly list price of the plan plus Custom blocks ($5 each, Business only); 0 for Free, no
 * plan, trials, payment issues and ended subscriptions. Annual plans count at the monthly price.
 */
export function monthlyValue(u: Row, now = Date.now()): number {
  if (segmentOf(u, now) !== "paid") return 0;
  const blocks = u.plan === "business" ? Math.max(0, u.sitePackCount ?? 0) : 0;
  return planPrice(u.plan) + blocks * CUSTOM.blockPrice;
}

/**
 * Uptime checks per minute a site needs (paid: every minute, legacy Free: every 5 min, Custom
 * sites past the first 100: every 3 min). Matches lib/monitor/schedule.ts.
 */
export function checksPerMinute(plan: string, extraCustomSite = false): number {
  if (extraCustomSite) return 1 / CUSTOM_EXTRA_EVERY_MIN;
  const every = (CHECK_EVERY_MIN as Record<string, number>)[plan] ?? CHECK_EVERY_MIN.free;
  return 1 / every;
}

/** Free Cloudflare Worker budget used for the capacity gauge (sites checked per minute). */
export const WORKER_CAPACITY_PER_MIN = 600;
/** Resend free plan: 100 emails a day. */
export const RESEND_DAILY_LIMIT = 100;
