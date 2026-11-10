import { CATS, DOWN_SITES, type SiteCat } from "./sites";
import { STATUS_PAGES } from "./status";

export type { SiteCat };
export { CATS, DOWN_SITES };

export type DownSite = {
  host: string;
  name: string;
  cat: SiteCat;
  catLabel: string;
  statusUrl?: string;
};

const CAT_LABEL: Record<SiteCat, string> = Object.fromEntries(CATS) as Record<SiteCat, string>;

export const SITES: DownSite[] = DOWN_SITES.map(([host, name, cat]) => ({
  host,
  name,
  cat,
  catLabel: CAT_LABEL[cat],
  statusUrl: STATUS_PAGES[host],
}));

const BY_HOST = new Map(SITES.map((s) => [s.host, s]));

export function getSite(host: string) {
  return BY_HOST.get(host.trim().toLowerCase()) ?? null;
}

export function sitesIn(cat: SiteCat) {
  return SITES.filter((s) => s.cat === cat);
}

/** Nearby pages for internal links: same category first, then a stable mix of others. */
export function relatedSites(host: string, n = 8): DownSite[] {
  const site = getSite(host);
  if (!site) return SITES.filter((s) => s.host !== host).slice(0, n);
  const same = SITES.filter((s) => s.cat === site.cat && s.host !== host);
  const rest = SITES.filter((s) => s.cat !== site.cat);
  const seed = hash(host);
  const picked = [...rotate(same, seed), ...rotate(rest, seed + 7)];
  return picked.slice(0, n);
}

function hash(s: string) {
  let n = 0;
  for (let i = 0; i < s.length; i++) n = (n * 33 + s.charCodeAt(i)) >>> 0;
  return n;
}

function rotate<T>(list: T[], seed: number) {
  if (list.length === 0) return list;
  const i = seed % list.length;
  return list.slice(i).concat(list.slice(0, i));
}

export const POPULAR_DOWN = [
  "instagram.com",
  "gmail.com",
  "chatgpt.com",
  "github.com",
  "irctc.co.in",
  "whatsapp.com",
  "netflix.com",
  "facebook.com",
]
  .map(getSite)
  .filter((s): s is DownSite => Boolean(s));
