import type { DayBar } from "@/lib/uptime-days";

const tone = (pct: number | null) =>
  pct == null ? "bg-ink/10" : pct >= 99.5 ? "bg-emerald-500" : pct >= 95 ? "bg-amber-500" : "bg-rose-500";

/** 90 daily bars (30 on phones). Pure markup, no client JS. */
export function UptimeBars({ bars }: { bars: DayBar[] }) {
  const cut = bars.length - 30;
  return (
    <div className="flex h-8 items-stretch gap-[2px]" role="img" aria-label="Daily uptime, oldest to newest">
      {bars.map((b, i) => (
        <span
          key={b.day}
          title={`${b.day}: ${b.pct == null ? "no data" : `${b.pct}% up`}`}
          className={`min-w-0 flex-1 ${tone(b.pct)} ${i < cut ? "hidden sm:block" : ""}`}
        />
      ))}
    </div>
  );
}
