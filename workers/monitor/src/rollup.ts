import { app, getMeta, setMeta } from "./store";
import type { Budget, Env } from "./types";
import { MIN } from "./types";

type Cell = [string, number, number, number | null]; // [siteId, ok, ms, code]

interface Agg {
  n: number;
  f: number;
  ms: number[];
  t: number;
  c: number | null;
}

/**
 * Once an hour: summarise the previous hour's checks (one row per site) and send them to the
 * app in a single request. Retried each minute until it succeeds; the ring buffer keeps two
 * hours, so a late roll-up still has its data. One call per batch keeps each run tiny (the
 * free plan allows 10 ms of CPU per run).
 */
export async function rollup(
  env: Env,
  budget: Budget,
  minute: number,
  shard: number,
): Promise<{ sent: number } | null> {
  const hourStart = Math.floor(minute / 60) * 60;
  const key = `rolled:${shard}`;
  const done = await getMeta(env, key);
  if (done && Number(done.v) >= hourStart) return null;
  const from = hourStart - 60;

  const { results } = await env.DB.prepare("SELECT ts, data FROM slots WHERE shard = ? AND ts >= ? AND ts < ?")
    .bind(shard, from, hourStart)
    .all<{ ts: number; data: string }>();
  const by = new Map<string, Agg>();
  for (const r of results) {
    let cells: Cell[] = [];
    try {
      cells = JSON.parse(r.data) as Cell[];
    } catch {
      continue;
    }
    for (const [id, ok, ms, code] of cells) {
      const a = by.get(id) ?? { n: 0, f: 0, ms: [], t: 0, c: null };
      a.n++;
      if (ok) a.ms.push(ms);
      else a.f++;
      if (r.ts >= a.t) {
        a.t = r.ts;
        a.c = code;
      }
      by.set(id, a);
    }
  }

  if (by.size > 0) {
    const { results: open } = await env.DB.prepare("SELECT id FROM state WHERE incident = 1").all<{ id: string }>();
    const down = new Set(open.map((o) => o.id));
    const rows = [...by].map(([i, a]) => ({
      i,
      n: Math.min(a.n, 100),
      f: Math.min(a.f, 100),
      m: median(a.ms),
      t: a.t * MIN,
      c: a.c,
      d: down.has(i) ? 1 : 0,
    }));
    const res = await app<{ saved: number }>(env, budget, "/api/monitor/ingest", { rows });
    if (!res) return { sent: -1 }; // try again next minute
    await setMeta(env, key, String(hourStart), Date.now());
    return { sent: res.saved };
  }
  await setMeta(env, key, String(hourStart), Date.now());
  return { sent: 0 };
}

function median(xs: number[]): number | null {
  if (xs.length === 0) return null;
  const s = [...xs].sort((a, b) => a - b);
  const mid = s.length >> 1;
  return Math.round(s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2);
}
