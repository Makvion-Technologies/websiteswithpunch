import { checkSite, pool } from "./check";
import { app, putSlot, putState, readStates, type StateRow } from "./store";
import type { Budget, CheckOutcome, Env, Site } from "./types";
import { MIN } from "./types";

const RETRY_AFTER_MS = 2_000;
const DISPUTE_MS = 10 * MIN;

interface Report {
  results: { siteId: string; outcome: "confirmed" | "not_confirmed" | "applied" | "missing" | "retry" }[];
}

export interface ChunkResult {
  checked: number;
  failed: number;
  skipped: number;
  events: number;
  confirmed: number;
}

/**
 * Check one batch of sites. A failure is retried once a couple of seconds later; if it
 * still fails, the app re-checks it from its own region before anything is saved or sent.
 */
export async function runChunk(
  env: Env,
  sites: Site[],
  minute: number,
  shard: number,
  allowance = 48,
): Promise<ChunkResult> {
  // Two requests are kept back for the report to the app.
  const budget: Budget = { left: allowance };
  const timeout = Number(env.CHECK_TIMEOUT_MS) || 15_000;
  const states = await readStates(env, sites.map((s) => s.i));
  const out: CheckOutcome[] = await pool(sites, 6, (s) => checkSite(s.u, budget, timeout));

  const failedIdx = out.map((r, i) => (!r.ok && !r.skip ? i : -1)).filter((i) => i >= 0);
  if (failedIdx.length > 0) {
    await new Promise((r) => setTimeout(r, RETRY_AFTER_MS));
    const again = await pool(failedIdx, 6, (i) => checkSite(sites[i].u, budget, timeout));
    failedIdx.forEach((i, k) => {
      // A skipped retry keeps the first failure; a passing retry counts as up.
      if (!again[k].skip) out[i] = again[k];
    });
  }

  const now = Date.now();
  const at = now;
  const events: Record<string, unknown>[] = [];
  sites.forEach((s, i) => {
    const r = out[i];
    if (r.skip) return;
    const st = states.get(s.i);
    // Open incident: confirmed here, or the app marked it down after our last change.
    const open = !!st?.incident || (s.d ?? 0) > (st?.since ?? 0);
    if (!r.ok && !open && (st?.disputed_until ?? 0) < now) {
      events.push({ siteId: s.i, url: s.u, kind: "down", at, statusCode: r.code, latencyMs: r.ms, error: r.err });
    } else if (r.ok && open) {
      events.push({ siteId: s.i, url: s.u, kind: "up", at, statusCode: r.code, latencyMs: r.ms, error: null });
    }
  });

  const writes: D1PreparedStatement[] = [];
  let confirmed = 0;
  if (events.length > 0) {
    budget.left = Math.max(budget.left, 1);
    const rep = await app<Report>(env, budget, "/api/monitor/report", { events });
    for (const res of rep?.results ?? []) {
      const prev = states.get(res.siteId);
      const base: StateRow = prev ?? { id: res.siteId, incident: 0, since: 0, disputed_until: 0 };
      const ev = events.find((e) => e.siteId === res.siteId);
      if (res.outcome === "confirmed") {
        confirmed++;
        writes.push(putState(env, { ...base, incident: 1, since: now, disputed_until: 0 }));
      } else if (res.outcome === "not_confirmed") {
        writes.push(putState(env, { ...base, disputed_until: now + DISPUTE_MS }));
      } else if (res.outcome === "applied" && ev?.kind === "up") {
        writes.push(putState(env, { ...base, incident: 0, since: now, disputed_until: 0 }));
      } else if (res.outcome === "missing") {
        writes.push(putState(env, { ...base, incident: 0, since: now, disputed_until: 0 }));
      }
      // "retry": nothing saved, so the next check tries again.
    }
  }

  const slot = sites.flatMap((s, i) => (out[i].skip ? [] : [[s.i, out[i].ok ? 1 : 0, out[i].ms, out[i].code]]));
  if (slot.length > 0) writes.push(putSlot(env, minute, shard, slot));
  // One batch = one D1 query (the free plan allows 50 per invocation).
  if (writes.length > 0) await env.DB.batch(writes);

  return {
    checked: slot.length,
    failed: out.filter((r) => !r.ok && !r.skip).length,
    skipped: out.filter((r) => r.skip).length,
    events: events.length,
    confirmed,
  };
}
