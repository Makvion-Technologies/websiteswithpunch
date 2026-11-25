/** Expiry calendar data (pure, unit tested). */
export type ExpirySite = { id: string; name: string; url: string; sslExpiresAt: Date | null; domainExpiresAt: Date | null };
export type ExpiryEvent = { siteId: string; siteName: string; host: string; kind: "ssl" | "domain"; date: string; daysLeft: number };

const DAY = 86_400_000;
const host = (u: string) => {
  try {
    return new URL(u).hostname;
  } catch {
    return u;
  }
};

export function expiryEvents(sites: ExpirySite[], now = Date.now()): ExpiryEvent[] {
  const out: ExpiryEvent[] = [];
  for (const s of sites) {
    for (const kind of ["ssl", "domain"] as const) {
      const d = kind === "ssl" ? s.sslExpiresAt : s.domainExpiresAt;
      if (!d) continue;
      out.push({ siteId: s.id, siteName: s.name, host: host(s.url), kind, date: d.toISOString().slice(0, 10), daysLeft: Math.ceil((d.getTime() - now) / DAY) });
    }
  }
  return out.sort((a, b) => a.date.localeCompare(b.date) || a.siteName.localeCompare(b.siteName));
}

export type MonthGroup = { key: string; label: string; events: ExpiryEvent[] };

/** Next `months` calendar months starting with the current one (overdue items go in the first). */
export function groupByMonth(events: ExpiryEvent[], months = 12, now = Date.now()): MonthGroup[] {
  const start = new Date(now);
  const groups: MonthGroup[] = [];
  for (let i = 0; i < months; i++) {
    const d = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + i, 1));
    const key = d.toISOString().slice(0, 7);
    groups.push({ key, label: d.toLocaleDateString("en-US", { month: "short", year: "numeric", timeZone: "UTC" }), events: [] });
  }
  const first = groups[0].key;
  const last = groups[groups.length - 1].key;
  for (const e of events) {
    const k = e.date.slice(0, 7);
    if (k < first) groups[0].events.push(e);
    else if (k <= last) groups.find((g) => g.key === k)?.events.push(e);
  }
  return groups;
}

export const urgency = (daysLeft: number): "overdue" | "soon" | "month" | "later" =>
  daysLeft < 0 ? "overdue" : daysLeft <= 7 ? "soon" : daysLeft <= 30 ? "month" : "later";
