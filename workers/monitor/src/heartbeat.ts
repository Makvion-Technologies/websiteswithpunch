import { app, getMeta, setMeta } from "./store";
import type { Budget, Env } from "./types";
import { MIN } from "./types";

/** Heartbeat config from the app: id, token, period s, grace s, paused. */
export interface Hb {
  i: string;
  t: string;
  p: number;
  g: number;
  z: number;
}

interface Row {
  id: string;
  token: string;
  period: number;
  grace: number;
  paused: number;
}

/** Most D1 statements in one batch (the free plan allows 50 queries per invocation). */
const MAX_WRITES = 40;

export function putHb(env: Env, h: Hb, now: number): D1PreparedStatement {
  // Resuming a paused heartbeat waits for the next ping, so old silence isn't an outage.
  return env.DB.prepare(
    `INSERT INTO hb (id, token, period, grace, paused, state, since) VALUES (?1, ?2, ?3, ?4, ?5, 0, ?6)
     ON CONFLICT(id) DO UPDATE SET token = excluded.token, period = excluded.period, grace = excluded.grace,
       state = CASE WHEN hb.paused = 1 AND excluded.paused = 0 THEN 0 ELSE hb.state END,
       since = CASE WHEN hb.paused = 1 AND excluded.paused = 0 THEN excluded.since ELSE hb.since END,
       paused = excluded.paused,
       due_at = CASE WHEN hb.last_ping > 0 THEN hb.last_ping + (excluded.period + excluded.grace) * 1000 ELSE 0 END`,
  ).bind(h.i, h.t, h.p, h.g, h.z ? 1 : 0, now);
}

export function validHb(x: unknown): x is Hb {
  const h = x as Hb;
  return (
    !!h && typeof h.i === "string" && h.i.length <= 40 && typeof h.t === "string" && /^[A-Za-z0-9_-]{24}$/.test(h.t) &&
    Number.isInteger(h.p) && h.p >= 60 && Number.isInteger(h.g) && h.g >= 0
  );
}

/** Live state for the dashboard: s 0 waiting / 1 up / 2 missed, l last ping, d due (ms). */
export async function hbStatus(env: Env, ids: string[]) {
  const list = ids.filter((i) => typeof i === "string").slice(0, 100);
  if (list.length === 0) return [];
  const { results } = await env.DB.prepare(
    `SELECT id AS i, state AS s, last_ping AS l, due_at AS d, paused AS z FROM hb WHERE id IN (${list.map(() => "?").join(",")})`,
  )
    .bind(...list)
    .all();
  return results;
}

/** Copy the heartbeat list from the app (hourly, or when stale). Writes only what changed. */
export async function hbRefresh(env: Env, budget: Budget, now: number, force: boolean): Promise<number> {
  const meta = await getMeta(env, "hbsync");
  if (!force && meta && now - meta.at < 70 * MIN) return -1;
  const got = await app<{ enabled: boolean; hbs: Hb[] }>(env, budget, "/api/monitor/heartbeats");
  // App unreachable (or not deployed yet): try again in about 10 minutes, not every minute.
  if (!got) {
    await setMeta(env, "hbsync", "0", now - 60 * MIN);
    return -1;
  }
  const want = new Map((got.enabled ? got.hbs : []).filter(validHb).map((h) => [h.i, h]));
  const { results: have } = await env.DB.prepare("SELECT id, token, period, grace, paused FROM hb").all<Row>();
  const writes: D1PreparedStatement[] = [];
  for (const r of have) {
    const h = want.get(r.id);
    if (!h) writes.push(env.DB.prepare("DELETE FROM hb WHERE id = ?").bind(r.id));
    else if (h.t !== r.token || h.p !== r.period || h.g !== r.grace || (h.z ? 1 : 0) !== r.paused) writes.push(putHb(env, h, now));
    want.delete(r.id);
  }
  for (const h of want.values()) writes.push(putHb(env, h, now));
  const part = writes.slice(0, MAX_WRITES);
  if (part.length > 0) await env.DB.batch(part);
  // More left over: leave the sync mark stale so the next minute carries on.
  if (writes.length <= MAX_WRITES) await setMeta(env, "hbsync", "1", now);
  return writes.length;
}

interface Due {
  id: string;
  last_ping: number;
  state: number;
}

/**
 * Every minute: heartbeats past period + grace are reported as missed, missed ones that pinged
 * again as resumed. Two indexed reads; one request to the app only when something changed.
 */
export async function hbTick(env: Env, budget: Budget, now: number) {
  const [late, back] = await env.DB.batch<Due>([
    env.DB.prepare("SELECT id, last_ping, state FROM hb WHERE state = 1 AND due_at < ? AND paused = 0 LIMIT 40").bind(now),
    env.DB.prepare("SELECT id, last_ping, state FROM hb WHERE state = 2 AND last_ping > since AND paused = 0 LIMIT 40"),
  ]);
  const due = [...late.results, ...back.results];
  if (due.length === 0) return { down: 0, up: 0 };
  const events = due.map((r) => ({ i: r.id, k: r.state === 1 ? "down" : "up", at: now, l: r.last_ping }));
  const rep = await app<{ results: { i: string; outcome: "applied" | "missing" | "retry" }[] }>(
    env, budget, "/api/monitor/heartbeats/report", { events },
  );
  const writes: D1PreparedStatement[] = [];
  let down = 0;
  let up = 0;
  for (const r of rep?.results ?? []) {
    const ev = events.find((e) => e.i === r.i);
    if (!ev) continue;
    if (r.outcome === "missing") writes.push(env.DB.prepare("DELETE FROM hb WHERE id = ?").bind(r.i));
    else if (r.outcome === "applied") {
      if (ev.k === "down") down++;
      else up++;
      writes.push(env.DB.prepare("UPDATE hb SET state = ?, since = ? WHERE id = ?").bind(ev.k === "down" ? 2 : 1, now, r.i));
    }
  }
  if (writes.length > 0) await env.DB.batch(writes);
  return { down, up };
}

/** Once an hour: pings stored per heartbeat since the last report, for the 90-day history. */
export async function hbRollup(env: Env, budget: Budget, minute: number) {
  const hourStart = Math.floor(minute / 60) * 60;
  const done = await getMeta(env, "hbrolled");
  if (done && Number(done.v) >= hourStart) return null;
  const { results } = await env.DB.prepare("SELECT id AS i, cnt AS c, last_ping AS l FROM hb WHERE cnt > 0 LIMIT ?")
    .bind(MAX_WRITES).all<{
    i: string;
    c: number;
    l: number;
  }>();
  if (results.length > 0) {
    const res = await app<{ saved: number }>(env, budget, "/api/monitor/heartbeats/ingest", { at: (hourStart - 1) * MIN, rows: results });
    if (!res) return { sent: -1 };
    const writes = results.map((r) => env.DB.prepare("UPDATE hb SET cnt = MAX(0, cnt - ?) WHERE id = ?").bind(r.c, r.i));
    await env.DB.batch(writes);
    if (results.length === MAX_WRITES) return { sent: res.saved }; // maybe more: next minute
  }
  await setMeta(env, "hbrolled", String(hourStart), Date.now());
  return { sent: results.length };
}
