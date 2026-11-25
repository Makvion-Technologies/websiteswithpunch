/**
 * Client helpers for public tool checks: skip bots, share one in-flight GET
 * (React Strict Mode remounts), and read ?q= / ?url= from the address bar.
 */

export type ToolReply = { ok: boolean; status: number; data: Record<string, unknown> };

const inflight = new Map<string, Promise<ToolReply>>();

/** True for crawlers, prerenders and other automated browsers. */
export function isAutomatedBrowser(ua: string, webdriver = false): boolean {
  if (webdriver) return true;
  return /bot|crawler|spider|slurp|bingpreview|facebookexternalhit|preview|prerender|lighthouse|pagespeed|google-inspectiontool|headlesschrome|headless|puppeteer|playwright|phantomjs|wget|curl|python-requests|scrapy/i.test(
    ua,
  );
}

/** Query from a tool page URL. `q` is the documented param; `url` is accepted as an alias. */
export function queryFromSearch(search: string): string {
  const raw = search.startsWith("?") ? search.slice(1) : search;
  const sp = new URLSearchParams(raw);
  return (sp.get("q") ?? sp.get("url") ?? "").trim().slice(0, 300);
}

/** One network request per URL while a lookup is already in flight. */
export function sharedToolGet(url: string): Promise<ToolReply> {
  let p = inflight.get(url);
  if (!p) {
    p = fetch(url)
      .then(async (res) => ({
        ok: res.ok,
        status: res.status,
        data: ((await res.json().catch(() => ({}))) ?? {}) as Record<string, unknown>,
      }))
      .finally(() => {
        if (inflight.get(url) === p) inflight.delete(url);
      });
    inflight.set(url, p);
  }
  return p;
}

/** Test-only: drop in-flight entries. */
export function resetSharedToolGets() {
  inflight.clear();
}
