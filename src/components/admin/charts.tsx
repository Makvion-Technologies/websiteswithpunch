import type { ReactNode } from "react";

/** Server-rendered bar chart (inline SVG, no chart library, no client JS). */
export function BarChart({ data, label }: { data: Array<{ d: string; n: number }>; label: string }) {
  const max = Math.max(1, ...data.map((p) => p.n));
  const total = data.reduce((a, p) => a + p.n, 0);
  const w = 100 / Math.max(1, data.length);
  const first = data[0]?.d;
  const last = data[data.length - 1]?.d;
  const fmt = (d?: string) => (d ? new Date(`${d}T00:00:00Z`).toLocaleDateString("en-IN", { day: "numeric", month: "short", timeZone: "UTC" }) : "");
  return (
    <figure>
      <svg viewBox="0 0 100 40" preserveAspectRatio="none" role="img" aria-label={`${label}: ${total} in ${data.length} days, most in one day ${max}`} className="h-40 w-full">
        {[10, 20, 30].map((y) => <line key={y} x1="0" x2="100" y1={y} y2={y} className="stroke-rule" strokeWidth="0.15" vectorEffect="non-scaling-stroke" />)}
        {data.map((p, i) => {
          const h = (p.n / max) * 38;
          return (
            <rect key={p.d} x={i * w + w * 0.15} width={w * 0.7} y={40 - Math.max(h, p.n ? 0.8 : 0.25)} height={Math.max(h, p.n ? 0.8 : 0.25)} className={p.n ? "fill-accent" : "fill-ink/10"}>
              <title>{`${fmt(p.d)}: ${p.n}`}</title>
            </rect>
          );
        })}
      </svg>
      <figcaption className="mt-2 flex justify-between text-[11px] text-muted">
        <span>{fmt(first)}</span>
        <span>Peak {max} / day</span>
        <span>{fmt(last)}</span>
      </figcaption>
    </figure>
  );
}

/** Usage meter: blue under 60%, amber to 80%, red above. */
export function Meter({ label, used, limit, unit, note }: { label: string; used: number; limit: number; unit: string; note?: ReactNode }) {
  const pct = Math.min(100, Math.round((used / Math.max(1, limit)) * 100));
  const tone = pct >= 80 ? "bg-danger" : pct >= 60 ? "bg-amber-500" : "bg-accent";
  return (
    <div className="bg-surface px-4 py-4">
      <div className="flex items-baseline justify-between gap-2">
        <p className="truncate text-xs text-muted">{label}</p>
        <p className={`text-xs font-medium tabular-nums ${pct >= 80 ? "text-danger" : "text-ink"}`}>{pct}%</p>
      </div>
      <p className="mt-1 font-display text-xl font-medium tabular-nums text-ink">
        {used.toLocaleString("en-US")} <span className="text-sm font-normal text-muted">/ {limit.toLocaleString("en-US")} {unit}</span>
      </p>
      <div className="mt-2.5 h-1.5 bg-ink/10" role="meter" aria-valuemin={0} aria-valuemax={limit} aria-valuenow={used} aria-label={label}>
        <div className={`h-1.5 ${tone}`} style={{ width: `${pct}%` }} />
      </div>
      {note && <p className="mt-2 text-xs text-muted">{note}</p>}
    </div>
  );
}

/** Horizontal share bars (plan mix, countries, sources). */
export function ShareList({ rows, empty = "No data yet." }: { rows: Array<{ label: ReactNode; n: number; key: string }>; empty?: string }) {
  const total = rows.reduce((a, r) => a + r.n, 0);
  if (!rows.length || !total) return <p className="px-4 py-6 text-sm text-muted">{empty}</p>;
  return (
    <ul className="space-y-3 px-4 py-4">
      {rows.map((r) => {
        const pct = Math.round((r.n / total) * 100);
        return (
          <li key={r.key}>
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span className="min-w-0 truncate text-ink">{r.label}</span>
              <span className="shrink-0 tabular-nums text-muted">{r.n.toLocaleString("en-US")} · {pct}%</span>
            </div>
            <div className="mt-1.5 h-1 bg-ink/10" aria-hidden><div className="h-1 bg-accent" style={{ width: `${pct}%` }} /></div>
          </li>
        );
      })}
    </ul>
  );
}
