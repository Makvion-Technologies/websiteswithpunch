/**
 * Coarse location and device from request headers. Free: Vercel adds x-vercel-ip-* headers to
 * every request (no paid geo API). Nothing here keeps the IP address.
 */
export type HeaderBag = Headers | Record<string, unknown> | undefined | null;
export type Geo = { country: string | null; region: string | null; city: string | null };

export function header(h: HeaderBag, name: string): string | null {
  if (!h) return null;
  if (typeof (h as Headers).get === "function") return (h as Headers).get(name);
  const v = (h as Record<string, unknown>)[name] ?? (h as Record<string, unknown>)[name.toLowerCase()];
  return Array.isArray(v) ? String(v[0] ?? "") || null : typeof v === "string" ? v : null;
}

const clean = (v: string | null, max: number) => {
  if (!v) return null;
  let s = v;
  try { s = decodeURIComponent(v); } catch { /* keep raw */ }
  s = s.replace(/[\u0000-\u001f<>]/g, "").trim().slice(0, max);
  return s || null;
};

export function geoFromHeaders(h: HeaderBag): Geo {
  const raw = header(h, "x-vercel-ip-country")?.trim().toUpperCase() ?? "";
  return {
    country: /^[A-Z]{2}$/.test(raw) ? raw : null,
    region: clean(header(h, "x-vercel-ip-country-region"), 8),
    city: clean(header(h, "x-vercel-ip-city"), 60),
  };
}

/** "Desktop · Chrome", "Mobile · Safari"… Coarse on purpose (no versions, no fingerprinting). */
export function deviceFromUA(ua: string | null | undefined): string | null {
  if (!ua) return null;
  const kind = /iPad|Tablet/i.test(ua) ? "Tablet" : /Mobi|Android|iPhone/i.test(ua) ? "Mobile" : "Desktop";
  const browser =
    /Edg\//.test(ua) ? "Edge"
    : /OPR\/|Opera/.test(ua) ? "Opera"
    : /SamsungBrowser/.test(ua) ? "Samsung Internet"
    : /Firefox\/|FxiOS/.test(ua) ? "Firefox"
    : /Chrome\/|CriOS/.test(ua) ? "Chrome"
    : /Safari\//.test(ua) ? "Safari"
    : "Other";
  return `${kind} · ${browser}`;
}

const REGIONS = typeof Intl !== "undefined" && "DisplayNames" in Intl ? new Intl.DisplayNames(["en"], { type: "region" }) : null;
export function countryName(code: string | null | undefined): string | null {
  if (!code) return null;
  try { return REGIONS?.of(code) ?? code; } catch { return code; }
}
