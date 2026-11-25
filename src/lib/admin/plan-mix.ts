/**
 * Plan segments and revenue estimate. Pure and plan-agnostic: any plan id in PLANS is priced from
 * there, so new paid plans show up without changes here.
 */
import { PLANS, getPackConfig } from "@/lib/plans";

export type Segment = "paid" | "trial" | "at-risk" | "free";
export const SEGMENT_LABEL: Record<Segment, string> = { paid: "Paying", trial: "On trial", "at-risk": "Payment issue", free: "Free / legacy free" };

const ENDED = ["cancelled", "expired", "failed"];
type Row = { plan: string; dodoStatus: string | null; sitePackCount?: number | null };

export function segmentOf(u: Row): Segment {
  if (!u.plan || u.plan === "free") return "free";
  if (u.dodoStatus === "trialing") return "trial";
  if (u.dodoStatus === "past_due" || u.dodoStatus === "on_hold") return "at-risk";
  return "paid";
}

export function planPrice(plan: string): number {
  return (PLANS as Record<string, { price: number }>)[plan]?.price ?? 0;
}

/** Monthly list price of the plan plus its packs; 0 for free, trials and ended subscriptions. */
export function monthlyValue(u: Row): number {
  if (segmentOf(u) !== "paid" || ENDED.includes(u.dodoStatus ?? "")) return 0;
  const pack = getPackConfig(u.plan) as { pricePerMonth: number } | null | undefined;
  return planPrice(u.plan) + (u.sitePackCount ?? 0) * (pack?.pricePerMonth ?? 0);
}

/** Uptime checks per minute a site needs on its owner's plan (free: every 5 min, paid: every minute). */
export function checksPerMinute(plan: string): number {
  return !plan || plan === "free" ? 0.2 : 1;
}

/** Free Cloudflare Worker budget used for the capacity gauge (sites checked per minute). */
export const WORKER_CAPACITY_PER_MIN = 600;
/** Resend free plan: 100 emails a day. */
export const RESEND_DAILY_LIMIT = 100;
