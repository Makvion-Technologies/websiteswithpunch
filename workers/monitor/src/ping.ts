import type { Env } from "./types";

/**
 * Public ping endpoint: GET, POST or HEAD /hb/<token>. Costs one Worker request, at most one
 * D1 read and (throttled) one D1 write. Floods are cut off in memory before D1 is touched.
 */
const TOKEN_RE = /^[A-Za-z0-9_-]{24}$/;
const DAY_MS = 86_400_000;
/** Per isolate: at most RATE_MAX pings per token per RATE_WINDOW. */
const RATE_WINDOW = 10_000;
const RATE_MAX = 10;
/** Unknown tokens are remembered for a minute so guessing doesn't reach D1. */
const MISS_MS = 60_000;
/** Store a ping at most every 30 s; after 300 stored in a UTC day, every 5 minutes. */
const GAP_MS = 30_000;
const GAP_BUSY_MS = 300_000;
const DAY_CAP = 300;

const hits = new Map<string, { w: number; c: number }>();
const misses = new Map<string, number>();

function reply(req: Request, status: number, body: string): Response {
  return new Response(req.method === "HEAD" ? null : body, {
    status,
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "no-store",
      "access-control-allow-origin": "*",
      "x-robots-tag": "noindex",
    },
  });
}

export async function handlePing(req: Request, env: Env, token: string): Promise<Response> {
  if (req.method === "OPTIONS") return reply(req, 204, "");
  if (!["GET", "POST", "HEAD"].includes(req.method)) return reply(req, 405, "Use GET, POST or HEAD\n");
  if (!TOKEN_RE.test(token)) return reply(req, 404, "Unknown heartbeat\n");
  const now = Date.now();
  if (hits.size > 5000) hits.clear();
  if (misses.size > 5000) misses.clear();

  const miss = misses.get(token);
  if (miss && now - miss < MISS_MS) return reply(req, 404, "Unknown heartbeat\n");
  const h = hits.get(token);
  if (h && now - h.w < RATE_WINDOW) {
    if (++h.c > RATE_MAX) return reply(req, 429, "Too many pings. One per run is enough.\n");
  } else hits.set(token, { w: now, c: 1 });

  try {
    const row = await env.DB.prepare("SELECT last_ping, day, n FROM hb WHERE token = ?")
      .bind(token)
      .first<{ last_ping: number; day: number; n: number }>();
    if (!row) {
      misses.set(token, now);
      return reply(req, 404, "Unknown heartbeat\n");
    }
    const today = Math.floor(now / DAY_MS);
    const n = row.day === today ? row.n : 0;
    if (now - row.last_ping >= (n < DAY_CAP ? GAP_MS : GAP_BUSY_MS)) {
      await env.DB.prepare(
        `UPDATE hb SET last_ping = ?1, due_at = ?1 + (period + grace) * 1000,
         since = CASE WHEN state = 0 THEN ?1 ELSE since END, state = CASE WHEN state = 0 THEN 1 ELSE state END,
         day = ?2, n = ?3, cnt = cnt + 1 WHERE token = ?4`,
      )
        .bind(now, today, n + 1, token)
        .run();
    }
    return reply(req, 200, "OK\n");
  } catch {
    // D1 unavailable or over its free limit: say so, never pretend the ping was saved.
    return reply(req, 503, "Try again shortly\n");
  }
}
