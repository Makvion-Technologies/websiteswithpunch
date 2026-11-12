import { Svg, T } from "./parts";

/** A 10-minute outage on a 60-minute axis, and which check intervals see it. */
export function CheckIntervalsFigure() {
  const W = 400;
  const x0 = 78;
  const span = W - x0 - 6;
  const X = (m: number) => x0 + (m / 60) * span;
  const [a, b] = [16.5, 26.5];
  const rows = [
    { label: "1 min", every: 1, note: "seen at 17 min" },
    { label: "5 min", every: 5, note: "seen at 20 min" },
    { label: "15 min", every: 15, note: "missed" },
    { label: "60 min", every: 60, note: "missed" },
  ];
  return (
    <Svg
      id="fig-intervals"
      w={W}
      h={300}
      title="Which check intervals catch a 10-minute outage"
      desc="An outage from minute 16.5 to 26.5. Checks every minute see it at minute 17, checks every 5 minutes at minute 20, while checks every 15 or 60 minutes miss it completely."
    >
      <rect x={X(a)} y={4} width={X(b) - X(a)} height={250} className="fill-danger/10" />
      <T x={(X(a) + X(b)) / 2} y={22} size={15} tone="danger" bold textAnchor="middle">
        outage
      </T>
      {rows.map((r, i) => {
        const y = 62 + i * 52;
        const ticks = Array.from({ length: Math.floor(60 / r.every) + 1 }, (_, k) => k * r.every);
        const hit = ticks.find((t) => t >= a && t <= b);
        return (
          <g key={r.label}>
            <T x={0} y={y + 6} size={17} bold head>
              {r.label}
            </T>
            <line x1={x0} y1={y} x2={W - 6} y2={y} className="stroke-ink/20" />
            {ticks.map((t) => (
              <line key={t} x1={X(t)} y1={y - 7} x2={X(t)} y2={y + 7} className={t === hit ? "stroke-danger" : "stroke-ink/40"} strokeWidth={t === hit ? 3 : 1.25} />
            ))}
            <T x={hit !== undefined ? X(hit) + 8 : W - 6} y={y + 27} size={15} tone={hit !== undefined ? "danger" : "muted"} textAnchor={hit !== undefined ? "start" : "end"}>
              {r.note}
            </T>
          </g>
        );
      })}
      {[0, 15, 30, 45, 60].map((m) => (
        <T key={m} x={m === 60 ? W : X(m)} y={284} size={14} tone="muted" textAnchor={m === 60 ? "end" : "middle"}>
          {m}
        </T>
      ))}
      <T x={0} y={284} size={14} tone="muted">
        minutes
      </T>
    </Svg>
  );
}

