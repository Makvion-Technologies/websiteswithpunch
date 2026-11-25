/**
 * First-touch acquisition source. The proxy stores it in a 30-day cookie the first time a visitor
 * arrives with UTM tags or from another site; signup copies it onto the user once.
 */
export const SOURCE_COOKIE = "wwp_src";
export type FirstTouch = { source: string; medium?: string; campaign?: string; landing?: string };

const tidy = (v: string | null | undefined, max = 60) => (v ? v.replace(/[^\w .:/@+-]/g, "").trim().slice(0, max) || undefined : undefined);

/** Build the cookie value from a landing URL and its Referer, or null when there is nothing to keep. */
export function firstTouchFrom(url: URL, referer: string | null): string | null {
  const utm = tidy(url.searchParams.get("utm_source"));
  let refHost: string | undefined;
  if (referer) {
    try {
      const h = new URL(referer).hostname.replace(/^www\./, "");
      if (h && h !== url.hostname.replace(/^www\./, "")) refHost = tidy(h);
    } catch { /* ignore */ }
  }
  if (!utm && !refHost) return null;
  const p = new URLSearchParams();
  p.set("s", utm ?? refHost!);
  const m = tidy(url.searchParams.get("utm_medium"));
  const c = tidy(url.searchParams.get("utm_campaign"), 80);
  if (m) p.set("m", m);
  if (c) p.set("c", c);
  p.set("l", tidy(url.pathname, 120) ?? "/");
  return p.toString();
}

export function parseFirstTouch(raw: string | null | undefined): FirstTouch | null {
  if (!raw) return null;
  let p: URLSearchParams;
  try { p = new URLSearchParams(decodeURIComponent(raw)); } catch { return null; }
  const source = tidy(p.get("s"));
  if (!source) return null;
  return { source, medium: tidy(p.get("m")), campaign: tidy(p.get("c"), 80), landing: tidy(p.get("l"), 120) };
}

export function readCookie(header: string | null | undefined, name: string): string | null {
  const m = header?.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
  return m?.[1] ?? null;
}
