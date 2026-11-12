import { runChunk, type ChunkResult } from "./chunk";
import { rollup } from "./rollup";
import { loadSites } from "./store";
import type { Budget, Env, Site } from "./types";
import { MIN } from "./types";

/** Minute of the hour (UTC) when the site list is refreshed and last hour is rolled up. */
const HOURLY_AT = 2;
/** One request may start at most 32 Worker invocations (itself included). */
const MAX_FANOUT = 31;

export default {
  async scheduled(ctl: ScheduledController, env: Env, ctx: ExecutionContext): Promise<void> {
    ctx.waitUntil(tick(env, ctl.scheduledTime).then((r) => console.log("tick", JSON.stringify(r))));
  },

  async fetch(req: Request, env: Env): Promise<Response> {
    // Everything needs the shared secret; anything else looks like nothing is here.
    if (req.method !== "POST" || !authorized(req, env)) return new Response("Not found", { status: 404 });
    const path = new URL(req.url).pathname;
    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    if (path === "/run") {
      const sites = (body.sites as Site[]) ?? [];
      return Response.json(await runChunk(env, sites, Number(body.minute), Number(body.shard)));
    }
    if (path === "/rollup") {
      const budget: Budget = { left: 5 };
      return Response.json(await rollup(env, budget, Number(body.minute), Number(body.shard)));
    }
    if (path === "/sync") {
      // Called by the app when a site is added or removed, so new sites start within a minute.
      const sites = await loadSites(env, { left: 2 }, Date.now(), true);
      return Response.json({ sites: sites.length });
    }
    if (path === "/tick") return Response.json(await tick(env, Date.now()));
    return new Response("Not found", { status: 404 });
  },
};

function authorized(req: Request, env: Env): boolean {
  const secret = env.MONITOR_SECRET ?? "";
  const got = req.headers.get("authorization") ?? "";
  const want = `Bearer ${secret}`;
  if (secret.length < 24 || got.length !== want.length) return false;
  let diff = 0;
  for (let i = 0; i < want.length; i++) diff |= got.charCodeAt(i) ^ want.charCodeAt(i);
  return diff === 0;
}

/** Stable small number per site id, so 5-minute sites are spread over the 5 minutes. */
function offset(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return h;
}

async function tick(env: Env, now: number) {
  const minute = Math.floor(now / MIN);
  const hourly = minute % 60 === HOURLY_AT;
  const budget: Budget = { left: 48 };
  const sites = await loadSites(env, budget, now, hourly);
  const size = Math.max(1, Math.min(Number(env.CHUNK) || 20, 90));

  // Batches are fixed by position in the (id-sorted) list, so a site stays in one batch.
  const batches: Site[][] = [];
  for (let b = 0; b * size < sites.length; b++) {
    const part = sites.slice(b * size, (b + 1) * size);
    batches.push(part.filter((s) => (minute + offset(s.i)) % Math.max(1, s.e) === 0));
  }

  const results: (ChunkResult | null)[] = [];
  const due = batches.map((b, i) => ({ b, i })).filter((x) => x.b.length > 0);
  // Over the cap (about 600 sites due in one minute at CHUNK=20): the rest wait a minute.
  // Rotate which batches go first so none is always the one left out.
  const start = due.length > MAX_FANOUT ? minute % due.length : 0;
  const work = [...due.slice(start), ...due.slice(0, start)].slice(0, MAX_FANOUT);
  if (work.length === 1 && !env.SELF) {
    results.push(await runChunk(env, work[0].b, minute, work[0].i, budget.left - 2));
  } else if (work.length > 0) {
    // Each batch runs in its own invocation with its own request allowance.
    results.push(
      ...(await Promise.all(work.map((x) => self<ChunkResult>(env, "/run", { sites: x.b, minute, shard: x.i })))),
    );
  }

  // Roll up last hour (from minute 2 on; retried each minute until every batch is done).
  let rolled = 0;
  if (minute % 60 >= HOURLY_AT && batches.length > 0) {
    const hourStart = Math.floor(minute / 60) * 60;
    const { results: marks } = await env.DB.prepare("SELECT k, v FROM meta WHERE k LIKE 'rolled:%'").all<{
      k: string;
      v: string;
    }>();
    const done = new Set(marks.filter((m) => Number(m.v) >= hourStart).map((m) => m.k));
    const room = Math.max(0, MAX_FANOUT - work.length);
    const todo = batches
      .map((_, i) => i)
      .filter((i) => !done.has(`rolled:${i}`))
      .slice(0, room);
    if (todo.length === 1 && !env.SELF) await rollup(env, { left: 2 }, minute, todo[0]);
    else await Promise.all(todo.map((shard) => self(env, "/rollup", { minute, shard })));
    rolled = todo.length;
  }

  return { minute, sites: sites.length, batches: work.length, waiting: due.length - work.length, rolled, results };
}

/** Run part of the job in a fresh invocation of this Worker (service binding to itself). */
async function self<T>(env: Env, path: string, body: unknown): Promise<T | null> {
  if (!env.SELF) return null;
  try {
    const res = await env.SELF.fetch(`https://monitor${path}`, {
      method: "POST",
      headers: { authorization: `Bearer ${env.MONITOR_SECRET}`, "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    return res.ok ? ((await res.json()) as T) : null;
  } catch {
    return null;
  }
}
