import type { Heartbeat } from "@prisma/client";
import type { PlanId } from "@/lib/plans";
import { effectivePeriod, HEARTBEATS, HEARTBEAT_LIMIT } from "./config";

/**
 * App → monitor Worker calls for heartbeats. Best effort: never throws, gives up after a few
 * seconds, and the Worker re-copies the whole list from /api/monitor/heartbeats every hour.
 */
const base = () => (process.env.MONITOR_WORKER_URL || "").replace(/\/$/, "");

/**
 * Where jobs send pings. Default: the Worker's own /hb/ path, so pings never use Vercel or Neon.
 * HEARTBEAT_PING_URL can point at a custom domain routed to the same Worker.
 */
export function pingBase(): string {
  const custom = (process.env.HEARTBEAT_PING_URL || "").replace(/\/$/, "");
  return custom || (base() ? `${base()}/hb` : "");
}

export const pingUrl = (token: string) => `${pingBase()}/${token}`;

/** What the Worker needs: id, token, period (Free floor applied), grace, paused (or over the plan limit). */
export type WorkerHb = { i: string; t: string; p: number; g: number; z: number };

export function toWorker(h: Pick<Heartbeat, "id" | "token" | "periodSec" | "graceSec" | "paused">, plan: PlanId, over: boolean): WorkerHb {
  return { i: h.id, t: h.token, p: effectivePeriod(h.periodSec, plan), g: h.graceSec, z: h.paused || over ? 1 : 0 };
}

/** Ids beyond the plan limit (oldest are kept), e.g. after a downgrade. They don't run. */
export function overLimitIds(list: { id: string; createdAt: Date }[], plan: PlanId): Set<string> {
  const sorted = [...list].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime() || a.id.localeCompare(b.id));
  return new Set(sorted.slice(HEARTBEAT_LIMIT[plan]).map((h) => h.id));
}

async function call<T>(path: string, body: unknown, ms = 3000): Promise<T | null> {
  const secret = process.env.MONITOR_SECRET;
  if (!HEARTBEATS || !base() || !secret) return null;
  try {
    const res = await fetch(`${base()}${path}`, {
      method: "POST",
      headers: { authorization: `Bearer ${secret}`, "content-type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(ms),
      cache: "no-store",
    });
    return res.ok ? ((await res.json()) as T) : null;
  } catch {
    return null;
  }
}

export const pushHeartbeat = async (hb: WorkerHb) => Boolean(await call<{ ok: boolean }>("/hbput", { hb }));
export const dropHeartbeat = async (id: string) => Boolean(await call<{ ok: boolean }>("/hbdel", { i: id }));
export const syncHeartbeats = async () => Boolean(await call<{ changes: number }>("/hbsync", {}, 8000));

/** Live state from the Worker: s 0 waiting / 1 up / 2 missed, l last ping ms, d alert-after ms. */
export type LiveHb = { i: string; s: number; l: number; d: number; z: number };

export async function liveStatus(ids: string[]): Promise<Map<string, LiveHb> | null> {
  if (ids.length === 0) return new Map();
  const got = await call<{ rows: LiveHb[] }>("/hbstatus", { ids }, 1500);
  return got ? new Map(got.rows.map((r) => [r.i, r])) : null;
}
