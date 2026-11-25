import type { PlanId } from "@/lib/plans";
import { FAST_CHECKS } from "@/lib/monitor/config";

/**
 * Heartbeat (cron job) monitors. They need the monitor Worker (it answers the pings and looks
 * for missed ones every minute), so they are on only when fast checks are on AND
 * NEXT_PUBLIC_HEARTBEATS=1. Off by default: no page or price card mentions them until then.
 */
export const HEARTBEATS = FAST_CHECKS && process.env.NEXT_PUBLIC_HEARTBEATS === "1";

export const HEARTBEAT_LIMIT: Record<PlanId, number> = { free: 1, starter: 5, pro: 30, business: 100 };

/** Heartbeats allowed: "free" gets 1 only on a legacy Free account; no plan gets none. */
export const heartbeatLimit = (plan: PlanId, legacyFree = true) => (plan === "free" && !legacyFree ? 0 : HEARTBEAT_LIMIT[plan]);

const MIN = 60;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

/** Expected time between pings (seconds). Free starts at 1 hour. */
export const PERIODS = [
  { s: 5 * MIN, label: "5 minutes", cron: "*/5 * * * *" },
  { s: 15 * MIN, label: "15 minutes", cron: "*/15 * * * *" },
  { s: HOUR, label: "1 hour", cron: "0 * * * *" },
  { s: DAY, label: "1 day", cron: "0 3 * * *" },
  { s: 7 * DAY, label: "1 week", cron: "0 3 * * 1" },
] as const;

/** Extra time after a late ping before it counts as missed. */
export const GRACES = [
  { s: MIN, label: "1 minute" },
  { s: 5 * MIN, label: "5 minutes" },
  { s: 15 * MIN, label: "15 minutes" },
  { s: HOUR, label: "1 hour" },
  { s: 6 * HOUR, label: "6 hours" },
] as const;

export const FREE_MIN_PERIOD = HOUR;

export const minPeriod = (plan: PlanId) => (plan === "free" ? FREE_MIN_PERIOD : PERIODS[0].s);

export const isPeriod = (s: number) => PERIODS.some((p) => p.s === s);
export const isGrace = (s: number) => GRACES.some((g) => g.s === s);

/** Period the Worker enforces: a Free account keeps at least 1 hour even if it was set lower on a paid plan. */
export const effectivePeriod = (s: number, plan: PlanId) => Math.max(s, minPeriod(plan));

export function spanText(sec: number): string {
  const hit = [...PERIODS, ...GRACES].find((x) => x.s === sec);
  if (hit) return hit.label;
  if (sec % DAY === 0) return `${sec / DAY} days`;
  if (sec % HOUR === 0) return `${sec / HOUR} hours`;
  return `${Math.round(sec / MIN)} minutes`;
}

export const cronFor = (sec: number) => PERIODS.find((p) => p.s === sec)?.cron ?? "0 * * * *";

/** Ready-made snippets for the dashboard. */
export function snippets(url: string, periodSec: number) {
  const curl = `curl -fsS -m 10 --retry 3 -o /dev/null ${url}`;
  return {
    curl,
    wget: `wget -q -T 10 -t 3 -O /dev/null ${url}`,
    cron: `${cronFor(periodSec)} /path/to/your-job.sh && ${curl}`,
  };
}

/** A token is 24 URL-safe characters (144 random bits). */
export const TOKEN_RE = /^[A-Za-z0-9_-]{24}$/;
