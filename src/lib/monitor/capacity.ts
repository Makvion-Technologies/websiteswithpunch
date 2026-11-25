/** Capacity guard for Custom sizes (server only): keeps the Worker inside its free budget. */
import { CUSTOM } from "@/lib/plans";
import { FAST_CHECKS } from "./config";
import { currentCapacityUnits } from "./feed";
import { CAPACITY_STOP, WORKER_SITES_PER_MINUTE, capacityLevel, customExtraUnits, hasRoomFor } from "./schedule";

export type CapacityCheck = { ok: boolean; maxBlocks: number; units: number; level: ReturnType<typeof capacityLevel> };

/**
 * Can `addBlocks` more Custom blocks be sold right now? Also returns the largest total size that
 * still fits (for the slider). With fast checks off nothing runs on the Worker, so it always fits.
 */
export async function checkCustomCapacity(addBlocks: number): Promise<CapacityCheck> {
  if (!FAST_CHECKS) return { ok: true, maxBlocks: CUSTOM.maxBlocks, units: 0, level: "ok" };
  const units = await currentCapacityUnits();
  const room = WORKER_SITES_PER_MINUTE * CAPACITY_STOP - units;
  const perBlock = customExtraUnits(1);
  const maxBlocks = Math.max(0, Math.min(CUSTOM.maxBlocks, Math.floor(room / perBlock)));
  const level = capacityLevel(units);
  if (level !== "ok") console.warn(`[capacity] Worker load ${units.toFixed(0)}/${WORKER_SITES_PER_MINUTE} (${level})`);
  return { ok: hasRoomFor(units, customExtraUnits(addBlocks)), maxBlocks, units, level };
}
