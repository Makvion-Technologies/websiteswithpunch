import { ACTIVITY_LABEL, activityStatus, ago } from "@/lib/activity/status";

const TONE = { today: "bg-emerald-500", week: "bg-accent", month: "bg-amber-500", dormant: "bg-ink/25", never: "bg-ink/15" } as const;

/** "● 3 h ago" with the activity bucket as text for screen readers and the tooltip. */
export function ActivityDot({ at, now }: { at: Date | null; now: number }) {
  const s = activityStatus(at, now);
  return (
    <span className="inline-flex items-center gap-1.5" title={ACTIVITY_LABEL[s]}>
      <span className={`h-2 w-2 shrink-0 rounded-full ${TONE[s]}`} aria-hidden />
      <span className="tabular-nums">{ago(at, now)}</span>
      <span className="sr-only">({ACTIVITY_LABEL[s]})</span>
    </span>
  );
}
