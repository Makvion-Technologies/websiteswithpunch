/** Short, human durations and relative days for the overview lists. */
export function shortDuration(ms: number | null): string {
  if (ms == null) return "–";
  const m = Math.max(1, Math.round(ms / 60_000));
  if (m < 60) return `${m} min`;
  const h = Math.round(m / 6) / 10;
  return h < 48 ? `${h} h` : `${Math.round(h / 24)} days`;
}

export function inDays(d: number): string {
  if (d < 0) return `expired ${-d} day${d === -1 ? "" : "s"} ago`;
  if (d === 0) return "expires today";
  return `in ${d} day${d === 1 ? "" : "s"}`;
}

export const dayTone = (d: number) =>
  d <= 7 ? "text-rose-700 dark:text-rose-300" : d <= 30 ? "text-amber-700 dark:text-amber-300" : "text-muted";
