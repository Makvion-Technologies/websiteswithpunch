import type { Budget, Env, Site } from "./types";
import { MIN } from "./types";

/** Call the app with the shared secret. Costs one outgoing request. */
export async function app<T>(env: Env, budget: Budget, path: string, body?: unknown): Promise<T | null> {
  if (budget.left <= 0) return null;
  budget.left--;
  try {
    const res = await fetch(`${env.APP_URL.replace(/\/$/, "")}${path}`, {
      method: body === undefined ? "GET" : "POST",
      headers: {
        authorization: `Bearer ${env.MONITOR_SECRET}`,
        "content-type": "application/json",
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: AbortSignal.timeout(55_000),
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export async function getMeta(env: Env, k: string): Promise<{ v: string; at: number } | null> {
  return env.DB.prepare("SELECT v, at FROM meta WHERE k = ?").bind(k).first<{ v: string; at: number }>();
}

export async function setMeta(env: Env, k: string, v: string, at: number): Promise<void> {
  await env.DB.prepare(
    "INSERT INTO meta (k, v, at) VALUES (?, ?, ?) ON CONFLICT(k) DO UPDATE SET v = excluded.v, at = excluded.at",
  )
    .bind(k, v, at)
    .run();
}

/**
 * The site list, cached in D1. It is fetched from the app once an hour (or when forced),
 * so the app's database is not woken every minute.
 */
export async function loadSites(env: Env, budget: Budget, now: number, refresh: boolean): Promise<Site[]> {
  const row = await getMeta(env, "sites");
  const stale = !row || now - row.at > 70 * MIN;
  if (refresh || stale) {
    const got = await app<{ enabled: boolean; sites: Site[] }>(env, budget, "/api/monitor/sites");
    if (got) {
      const sites = got.enabled ? got.sites : [];
      const v = JSON.stringify(sites);
      // Write only if it changed, or to bump the timestamp of a stale cache.
      if (!row || row.v !== v || stale) await setMeta(env, "sites", v, now);
      return sites;
    }
  }
  if (!row) return [];
  try {
    return JSON.parse(row.v) as Site[];
  } catch {
    return [];
  }
}

export interface StateRow {
  id: string;
  incident: number;
  since: number;
  disputed_until: number;
}

export async function readStates(env: Env, ids: string[]): Promise<Map<string, StateRow>> {
  const map = new Map<string, StateRow>();
  if (ids.length === 0) return map;
  const q = `SELECT id, incident, since, disputed_until FROM state WHERE id IN (${ids.map(() => "?").join(",")})`;
  const { results } = await env.DB.prepare(q).bind(...ids).all<StateRow>();
  for (const r of results) map.set(r.id, r);
  return map;
}

export function putState(env: Env, s: StateRow): D1PreparedStatement {
  return env.DB.prepare(
    `INSERT INTO state (id, incident, since, disputed_until) VALUES (?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET incident = excluded.incident, since = excluded.since,
     disputed_until = excluded.disputed_until`,
  ).bind(s.id, s.incident, s.since, s.disputed_until);
}

/** One compact row per batch per minute: [siteId, ok, ms, code][]. */
export function putSlot(env: Env, minute: number, shard: number, data: unknown[]): D1PreparedStatement {
  return env.DB.prepare(
    `INSERT INTO slots (slot, ts, shard, data) VALUES (?, ?, ?, ?)
     ON CONFLICT(slot) DO UPDATE SET ts = excluded.ts, shard = excluded.shard, data = excluded.data`,
  ).bind(`${minute % 120}:${shard}`, minute, shard, JSON.stringify(data));
}
