/** Activity buckets from the last session start (or login). Pure, shared by admin pages and tests. */
const DAY = 86_400_000;
/** A session-start or login write is skipped when the previous one was this recent. */
export const MIN_WRITE_GAP_MS = 60_000;

export type ActivityStatus = "today" | "week" | "month" | "dormant" | "never";

export function activityStatus(last: Date | null | undefined, now = Date.now()): ActivityStatus {
  if (!last) return "never";
  const age = now - last.getTime();
  if (age < DAY) return "today";
  if (age < 7 * DAY) return "week";
  if (age < 30 * DAY) return "month";
  return "dormant";
}

export const ACTIVITY_LABEL: Record<ActivityStatus, string> = {
  today: "Active today", week: "This week", month: "This month", dormant: "Dormant 30d+", never: "Never active",
};

/** Window start for an activity filter (users whose lastActiveAt falls inside it). */
export function activityWhere(f: string | undefined, now = Date.now()) {
  const at = (d: number) => new Date(now - d * DAY);
  if (f === "today") return { lastActiveAt: { gte: at(1) } };
  if (f === "week") return { lastActiveAt: { gte: at(7) } };
  if (f === "month") return { lastActiveAt: { gte: at(30) } };
  if (f === "dormant") return { OR: [{ lastActiveAt: { lt: at(30) } }, { lastActiveAt: null }] };
  return {};
}

/** True when a new write is allowed (nothing recorded yet, or the last one is older than the gap). */
export function shouldRecord(last: Date | null | undefined, now = Date.now(), gap = MIN_WRITE_GAP_MS): boolean {
  return !last || now - last.getTime() >= gap;
}

/** "3 min ago", "5 h ago", "12 d ago". Fixed text, so server and client never disagree. */
export function ago(d: Date | null | undefined, now = Date.now()): string {
  if (!d) return "Never";
  const s = Math.max(0, Math.round((now - d.getTime()) / 1000));
  if (s < 60) return "Just now";
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86_400) return `${Math.floor(s / 3600)} h ago`;
  if (s < 60 * 86_400) return `${Math.floor(s / 86_400)} d ago`;
  return `${Math.floor(s / (30 * 86_400))} mo ago`;
}

/** Request time for server components (kept out of render bodies for the purity lint). */
export const clock = () => Date.now();
