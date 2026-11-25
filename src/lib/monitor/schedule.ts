/**
 * How the Worker's minute budget is shared (pure helpers, no DB).
 *
 * The Worker (workers/monitor) splits the app's site list into fixed batches of CHUNK (20) by
 * position, runs at most MAX_FANOUT (31) non-empty batches a minute, and inside a batch checks
 * the sites where (minute + offset(id)) % e === 0. So a site checked every 3 minutes only saves
 * room if the sites sharing its batch are due in the same minutes. orderForWorker sorts the list
 * by (interval, phase) so slower sites sit together and their batches are empty on off-minutes.
 * The Worker itself is unchanged: it keeps whatever order the app sends.
 */
import { CHECK_EVERY_MIN, CUSTOM_EXTRA_EVERY_MIN } from "./config";
import { CUSTOM, type PlanId } from "@/lib/plans";

/** Same hash as workers/monitor/src/index.ts offset(). Keep them identical. */
export function workerOffset(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return h;
}

/** Sites the Worker can check in one minute (31 batches × 20, with a little headroom). */
export const WORKER_SITES_PER_MINUTE = Number(process.env.WORKER_SITES_PER_MINUTE) || 600;
/** Above this share of the budget, admins are warned. */
export const CAPACITY_WARN = 0.6;
/** Above this share, bigger Custom sizes stop being sold until capacity is added. */
export const CAPACITY_STOP = 0.8;

export type FeedSite = { i: string; u: string; e: number; d: number };

/**
 * Minutes between checks for each of one account's unlocked sites, oldest first. Custom
 * (Business + blocks): the first 100 every minute, the rest every CUSTOM_EXTRA_EVERY_MIN.
 */
export function intervalsForAccount(plan: PlanId, count: number): number[] {
  const base = CHECK_EVERY_MIN[plan];
  return Array.from({ length: count }, (_, idx) =>
    plan === "business" && idx >= CUSTOM.base ? Math.max(base, CUSTOM_EXTRA_EVERY_MIN) : base,
  );
}

/** Sort by interval, then by the minute the Worker will check it, then id (stable). */
export function orderForWorker<T extends { i: string; e: number }>(sites: T[]): T[] {
  const key = (s: T) => [s.e, workerOffset(s.i) % Math.max(1, s.e)] as const;
  return [...sites].sort((a, b) => {
    const [ae, ap] = key(a);
    const [be, bp] = key(b);
    return ae - be || ap - bp || (a.i < b.i ? -1 : a.i > b.i ? 1 : 0);
  });
}

/** Checks per minute on average: Σ 1/e. */
export function capacityUnits(sites: { e: number }[]): number {
  return sites.reduce((n, s) => n + 1 / Math.max(1, s.e), 0);
}

/** Load units a Custom size adds over plain Business (extra sites at the slower interval). */
export function customExtraUnits(blocks: number): number {
  return (Math.max(0, blocks) * CUSTOM.blockSites) / CUSTOM_EXTRA_EVERY_MIN;
}

export type CapacityLevel = "ok" | "warn" | "full";

export function capacityLevel(units: number): CapacityLevel {
  const share = units / WORKER_SITES_PER_MINUTE;
  if (share >= CAPACITY_STOP) return "full";
  if (share >= CAPACITY_WARN) return "warn";
  return "ok";
}

/** Can `addUnits` more load be sold while staying under the stop line? */
export function hasRoomFor(currentUnits: number, addUnits: number): boolean {
  return currentUnits + addUnits <= WORKER_SITES_PER_MINUTE * CAPACITY_STOP;
}
