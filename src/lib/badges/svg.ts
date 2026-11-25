/** Flat shields-style SVG badge (pure, unit tested). Label in the logo blue. */
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// Approximate Verdana 11px advance widths: narrow, wide and default characters.
const width = (s: string) =>
  Math.ceil([...s].reduce((w, c) => w + (/[il.:!|' ]/.test(c) ? 3.6 : /[mwMW%]/.test(c) ? 10 : /[A-Z0-9]/.test(c) ? 7.4 : 6.6), 0)) + 12;

export const BADGE_COLORS = { up: "#12b76a", warn: "#dc8a04", down: "#d92d20", none: "#8a8f98" } as const;

export function badgeSvg(label: string, value: string, color: string): string {
  const lw = width(label);
  const vw = width(value);
  const w = lw + vw;
  const title = `${label}: ${value}`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="20" role="img" aria-label="${esc(title)}"><title>${esc(title)}</title><rect width="${lw}" height="20" fill="#1F6FEB"/><rect x="${lw}" width="${vw}" height="20" fill="${color}"/><g fill="#fff" text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" font-size="11"><text x="${lw / 2}" y="14">${esc(label)}</text><text x="${lw + vw / 2}" y="14">${esc(value)}</text></g></svg>`;
}

export function uptimeColor(pct: number | null): string {
  if (pct == null) return BADGE_COLORS.none;
  return pct >= 99.5 ? BADGE_COLORS.up : pct >= 95 ? BADGE_COLORS.warn : BADGE_COLORS.down;
}
