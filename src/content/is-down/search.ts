/**
 * Ranked type-ahead over official names, hosts, and ALIASES.
 * Pure: used by the hub combobox and unit tests. Blank queries return no hits.
 */
import { CATS, DOWN_SITES, type SiteCat } from "./sites";
import { ALIASES } from "./aliases";

export const SEARCH_LIMIT = 8;

export type SearchHit = { host: string; name: string; catLabel: string };

const CAT_LABEL = Object.fromEntries(CATS) as Record<SiteCat, string>;

type Field = { text: string; compact: string; words: string[] };

function fold(s: string) {
  return s.trim().toLowerCase().replace(/['’]/g, "").replace(/\s+/g, " ");
}

function compact(s: string) {
  return fold(s).replace(/&/g, "and").replace(/[^a-z0-9+]+/g, "");
}

function field(raw: string): Field {
  const text = fold(raw);
  return { text, compact: compact(raw), words: text.split(" ").filter(Boolean) };
}

type Row = SearchHit & { fields: Field[] };

const ROWS: Row[] = DOWN_SITES.map(([host, name, cat]) => {
  const fields = [field(name), field(host), field(host.replace(/\./g, ""))];
  for (const part of host.split(".")) {
    if (part.length >= 3) fields.push(field(part));
  }
  for (const a of ALIASES[host] ?? []) fields.push(field(a));
  return { host, name, catLabel: CAT_LABEL[cat], fields };
});

function scoreField(q: string, qc: string, f: Field): number {
  if (f.text === q || (qc.length > 0 && f.compact === qc)) return 4000 - Math.min(f.text.length, 200);
  if (f.text.startsWith(q) || (qc.length >= 2 && f.compact.startsWith(qc))) return 3000 - Math.min(f.text.length, 200);
  if (f.words.some((w) => w.startsWith(q))) return 2000 - Math.min(f.text.length, 200);
  if (q.length >= 2 && f.text.includes(q)) return 1000 - f.text.indexOf(q);
  if (qc.length >= 2 && f.compact.includes(qc)) return 800 - f.compact.indexOf(qc);
  return 0;
}

/** Best matches for a keystroke query, stable by score then list order. */
export function searchSites(query: string, limit = SEARCH_LIMIT): SearchHit[] {
  const q = fold(query);
  if (!q) return [];
  const qc = compact(query);
  const hits: { score: number; i: number }[] = [];
  for (let i = 0; i < ROWS.length; i++) {
    let best = 0;
    for (const f of ROWS[i].fields) {
      const s = scoreField(q, qc, f);
      if (s > best) best = s;
    }
    if (best > 0) hits.push({ score: best, i });
  }
  hits.sort((a, b) => b.score - a.score || a.i - b.i);
  return hits.slice(0, limit).map(({ i }) => {
    const { host, name, catLabel } = ROWS[i];
    return { host, name, catLabel };
  });
}
