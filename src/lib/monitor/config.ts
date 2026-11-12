import type { PlanId } from "@/lib/plans";

/**
 * Fast checks (Cloudflare Worker in /workers/monitor). Off by default: until
 * NEXT_PUBLIC_FAST_CHECKS=1 is set (and the app redeployed) the Worker gets an empty site list
 * and every page keeps describing the daily check, so nothing claims what isn't live.
 */
export const FAST_CHECKS = process.env.NEXT_PUBLIC_FAST_CHECKS === "1";

/** Minutes between background uptime checks per plan while fast checks are on. */
export const CHECK_EVERY_MIN: Record<PlanId, number> = { free: 5, pro: 1, business: 1 };

export function checkEveryMin(plan: PlanId | null | undefined): number | null {
  return FAST_CHECKS ? CHECK_EVERY_MIN[plan ?? "free"] : null;
}

/** "every minute" / "every 5 minutes" / "once a day". */
export function cadenceText(plan: PlanId | null | undefined): string {
  const m = checkEveryMin(plan);
  if (m == null) return "once a day";
  return m === 1 ? "every minute" : `every ${m} minutes`;
}

/** Closing note in alert emails. */
export function alertTimingNote(plan?: PlanId | null): string {
  if (!FAST_CHECKS) return "We check sites once a day and whenever you press Recheck, so alerts aren't real-time.";
  const how = plan ? cadenceText(plan) : "every 5 minutes (every minute on Pro and Business)";
  return `We check uptime ${how} and confirm a failure from a second location before emailing you.`;
}

/** "Sent to x@y …" line on the alert settings card. */
export function alertsSentWhen(): string {
  return FAST_CHECKS
    ? "when a background check (every 5 minutes, or every minute on Pro and Business) finds a confirmed change, or after a Recheck."
    : "after our daily check or a Recheck. Not real-time.";
}
