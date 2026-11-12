import type { Budget, CheckOutcome } from "./types";

const MAX_HOPS = 4;
const UA = "WebsitesWithPunch-Monitor/1.0 (+https://www.websiteswithpunch.com/contact)";

/**
 * One uptime check with the app's rules: the site's home page (origin), and if a www host
 * can't be reached at all, its apex. Up = final answer after redirects is 200-399.
 */
export async function checkSite(url: string, budget: Budget, timeoutMs: number): Promise<CheckOutcome> {
  let origin: URL;
  try {
    origin = new URL(/^https?:\/\//i.test(url) ? url : `https://${url}`);
  } catch {
    return { ok: false, code: null, ms: 0, err: "Invalid URL" };
  }
  const first = await fetchOnce(`${origin.protocol}//${origin.host}`, budget, timeoutMs);
  if (first.ok || first.skip || first.code !== null || !/^www\./i.test(origin.hostname)) return first;
  const apex = await fetchOnce(`${origin.protocol}//${origin.host.replace(/^www\./i, "")}`, budget, timeoutMs);
  return apex.ok || apex.skip || apex.code !== null ? apex : first;
}

/** Redirects are followed by hand because each hop costs one outgoing request. */
async function fetchOnce(url: string, budget: Budget, timeoutMs: number): Promise<CheckOutcome> {
  const started = Date.now();
  let current = url;
  for (let hop = 0; hop <= MAX_HOPS; hop++) {
    if (budget.left <= 0) return { ok: false, skip: true, code: null, ms: 0, err: null };
    budget.left--;
    const left = timeoutMs - (Date.now() - started);
    if (left < 500) return fail(started, null, "Timed out");
    let res: Response;
    try {
      res = await fetch(current, {
        method: "GET",
        redirect: "manual",
        headers: { "user-agent": UA, accept: "text/html,*/*;q=0.8" },
        signal: AbortSignal.timeout(left),
      });
    } catch (e) {
      const name = e instanceof Error ? e.name : "";
      return fail(started, null, name === "TimeoutError" || name === "AbortError" ? "Timed out" : "Could not connect");
    }
    // We only need the status line; drop the body so the connection is freed.
    try {
      await res.body?.cancel();
    } catch {
      /* ignore */
    }
    const loc = res.headers.get("location");
    if (res.status >= 300 && res.status < 400 && loc) {
      try {
        current = new URL(loc, current).href;
      } catch {
        return fail(started, res.status, "Bad redirect");
      }
      continue;
    }
    const ok = res.status >= 200 && res.status < 400;
    return { ok, code: res.status, ms: Date.now() - started, err: ok ? null : `HTTP ${res.status}` };
  }
  return fail(started, null, "Too many redirects");
}

function fail(started: number, code: number | null, err: string): CheckOutcome {
  return { ok: false, code, ms: Date.now() - started, err };
}

/** Run fn over items with at most `limit` in flight (the free plan allows 6 open connections). */
export async function pool<T, R>(items: T[], limit: number, fn: (t: T) => Promise<R>): Promise<R[]> {
  const out = new Array<R>(items.length);
  let next = 0;
  const worker = async () => {
    while (next < items.length) {
      const i = next++;
      out[i] = await fn(items[i]);
    }
  };
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return out;
}
