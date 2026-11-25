import { createHash } from "node:crypto";

/** Pure scheduling for weekly reports (unit tested). */
export const REPORT_DAY_MS = 86_400_000;

/** Weekday bucket 0–6 for a user, stable and spread evenly, so ~1/7 of reports go out each day. */
export function reportBucket(userId: string): number {
  return createHash("sha256").update(userId).digest()[0] % 7;
}

/** Today's UTC weekday bucket (0 = Thursday 1 Jan 1970, which is fine: it only has to rotate). */
export const todayBucket = (now = Date.now()) => Math.floor(now / REPORT_DAY_MS) % 7;

/** Due when it's the user's day, or the last one is over 8 days old (a missed run catches up). */
export function reportDue(userId: string, lastSentAt: Date | null, now = Date.now()): boolean {
  if (lastSentAt && now - lastSentAt.getTime() < 6 * REPORT_DAY_MS) return false;
  if (lastSentAt && now - lastSentAt.getTime() > 8 * REPORT_DAY_MS) return true;
  return reportBucket(userId) === todayBucket(now);
}

export function nextReportDate(userId: string, lastSentAt: Date | null, now = Date.now()): Date {
  for (let i = 0; i < 14; i++) {
    const t = now + i * REPORT_DAY_MS;
    if (reportDue(userId, lastSentAt, t)) return new Date(Math.floor(t / REPORT_DAY_MS) * REPORT_DAY_MS + 30 * 60_000 + 3_600_000);
  }
  return new Date(now + 7 * REPORT_DAY_MS);
}
