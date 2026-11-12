import { Svg, T } from "./parts";

type Row = { label: string; value: number; text: string };

/** Horizontal bar chart: label and value above each bar, bar length proportional to value. */
function Bars({ id, title, desc, rows, unit }: { id: string; title: string; desc: string; rows: Row[]; unit: string }) {
  const W = 400;
  const max = Math.max(...rows.map((r) => r.value));
  const h = rows.length * 62 + 26;
  return (
    <Svg id={id} w={W} h={h} title={title} desc={desc}>
      {rows.map((r, i) => {
        const y = i * 62;
        return (
          <g key={r.label}>
            <T x={0} y={y + 20} size={17} head bold>
              {r.label}
            </T>
            <T x={W} y={y + 20} size={15} tone="muted" textAnchor="end">
              {r.text}
            </T>
            <rect x={0} y={y + 30} width={W} height={18} className="fill-ink/[0.06]" />
            <rect x={0} y={y + 30} width={Math.max(3, (r.value / max) * W)} height={18} className="fill-accent" />
          </g>
        );
      })}
      <T x={0} y={h - 4} size={13} tone="muted">
        {unit}
      </T>
    </Svg>
  );
}

export function NinesFigure() {
  return (
    <Bars
      id="fig-nines"
      title="Allowed downtime per 30-day month"
      desc="99% allows 7 hours 12 minutes, 99.5% 3 hours 36 minutes, 99.9% 43 minutes, 99.95% 22 minutes and 99.99% about 4 minutes."
      unit="Downtime allowed in a 30-day month"
      rows={[
        { label: "99%", value: 432, text: "7 h 12 min" },
        { label: "99.5%", value: 216, text: "3 h 36 min" },
        { label: "99.9%", value: 43.2, text: "43 min" },
        { label: "99.95%", value: 21.6, text: "22 min" },
        { label: "99.99%", value: 4.32, text: "4 min 19 s" },
      ]}
    />
  );
}

export function CertLifetimesFigure() {
  return (
    <Bars
      id="fig-lifetimes"
      title="Maximum public TLS certificate lifetime by issue date"
      desc="398 days before 15 March 2026, 200 days from 15 March 2026, 100 days from 15 March 2027 and 47 days from 15 March 2029."
      unit="Maximum validity by issue date (Ballot SC-081v3)"
      rows={[
        { label: "Before 15 Mar 2026", value: 398, text: "398 days" },
        { label: "From 15 Mar 2026", value: 200, text: "200 days" },
        { label: "From 15 Mar 2027", value: 100, text: "100 days" },
        { label: "From 15 Mar 2029", value: 47, text: "47 days" },
      ]}
    />
  );
}

/** Stacked bar of the worked example in the downtime-cost post. */
export function DowntimeCostFigure() {
  const parts = [
    { label: "Lost revenue", v: 250, o: 1 },
    { label: "Developer time", v: 120, o: 0.65 },
    { label: "Staff time", v: 90, o: 0.4 },
    { label: "Wasted ads", v: 45, o: 0.2 },
  ];
  const W = 400;
  const total = parts.reduce((s, p) => s + p.v, 0);
  let x = 0;
  return (
    <Svg
      id="fig-cost"
      w={W}
      h={250}
      title="Cost of a 3-hour outage for a small shop: $505"
      desc="Lost revenue $250, developer time $120, staff time $90 and wasted ad spend $45, totalling $505."
    >
      <T x={0} y={26} size={20} head bold>
        3-hour outage ≈ ${total}
      </T>
      {parts.map((p) => {
        const w = (p.v / total) * W;
        const r = <rect key={p.label} x={x} y={44} width={w - 2} height={36} className="fill-accent" fillOpacity={p.o} />;
        x += w;
        return r;
      })}
      {parts.map((p, i) => (
        <g key={p.label}>
          <rect x={0} y={108 + i * 34} width={16} height={16} className="fill-accent" fillOpacity={p.o} />
          <T x={28} y={122 + i * 34} size={17}>
            {p.label}
          </T>
          <T x={W} y={122 + i * 34} size={17} bold textAnchor="end">
            ${p.v}
          </T>
        </g>
      ))}
    </Svg>
  );
}
