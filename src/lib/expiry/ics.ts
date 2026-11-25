import { createHmac, timingSafeEqual } from "node:crypto";
import { SITE_URL } from "@/lib/site-config";
import type { ExpiryEvent } from "./events";

function secret(): string {
  const s = process.env.BADGE_SECRET || process.env.NEXTAUTH_SECRET;
  if (!s) throw new Error("BADGE_SECRET (or NEXTAUTH_SECRET) is not set");
  return s;
}
const sig = (userId: string) => createHmac("sha256", `ics:${secret()}`).update(userId).digest("base64url").slice(0, 22);

export const calendarKey = (userId: string) => `${userId}.${sig(userId)}`;
export const calendarUrl = (userId: string) => `${SITE_URL}/api/calendar/${calendarKey(userId)}.ics`;

export function readCalendarKey(raw: string): string | null {
  const [id, s] = raw.replace(/\.ics$/, "").split(".");
  if (!id || !s || id.length > 40) return null;
  const a = Buffer.from(sig(id));
  const b = Buffer.from(s);
  return a.length === b.length && timingSafeEqual(a, b) ? id : null;
}

const esc = (s: string) => s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
const ymd = (d: string) => d.replace(/-/g, "");
const nextDay = (d: string) => new Date(Date.parse(`${d}T00:00:00Z`) + 86_400_000).toISOString().slice(0, 10);

/** iCalendar feed: one all-day event per expiry, with a 7-day reminder. Pure (unit tested). */
export function buildIcs(events: ExpiryEvent[], stamp = new Date()): string {
  const now = stamp.toISOString().replace(/[-:]/g, "").slice(0, 15) + "Z";
  const lines = [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Websites With Punch//Expiry calendar//EN", "CALSCALE:GREGORIAN",
    "X-WR-CALNAME:Websites With Punch expiries", "REFRESH-INTERVAL;VALUE=DURATION:PT12H",
  ];
  for (const e of events) {
    const what = e.kind === "ssl" ? "SSL certificate" : "Domain";
    lines.push(
      "BEGIN:VEVENT",
      `UID:${e.kind}-${e.siteId}-${ymd(e.date)}@websiteswithpunch.com`,
      `DTSTAMP:${now}`,
      `DTSTART;VALUE=DATE:${ymd(e.date)}`,
      `DTEND;VALUE=DATE:${ymd(nextDay(e.date))}`,
      `SUMMARY:${esc(`${what} expires: ${e.host}`)}`,
      `DESCRIPTION:${esc(`${e.siteName} (${e.host}). Renew before this date. ${SITE_URL}/dashboard/expiry`)}`,
      "BEGIN:VALARM", "ACTION:DISPLAY", `DESCRIPTION:${esc(`${what} for ${e.host} expires in 7 days`)}`, "TRIGGER:-P7D", "END:VALARM",
      "END:VEVENT",
    );
  }
  lines.push("END:VCALENDAR");
  return lines.join("\r\n") + "\r\n";
}
