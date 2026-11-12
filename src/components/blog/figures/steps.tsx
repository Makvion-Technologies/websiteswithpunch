import { Arrow, Box, Svg, T } from "./parts";

export type Step = { title: string; sub: string; tag?: string; tone?: "accent" | "danger"; edge?: string };

/**
 * Vertical flow of boxes joined by arrows (optionally labelled). Narrow on purpose (360 wide) so
 * text stays readable on a 360px phone without sideways scrolling.
 */
export function Steps({ id, title, desc, steps, numbered }: { id: string; title: string; desc: string; steps: Step[]; numbered?: boolean }) {
  const W = 360;
  const BH = 62;
  const GAP = 32;
  const h = steps.length * BH + (steps.length - 1) * GAP + 2;
  return (
    <Svg id={id} w={W} h={h} title={title} desc={desc}>
      {steps.map((s, i) => {
        const y = i * (BH + GAP) + 1;
        const tx = numbered ? 50 : 16;
        return (
          <g key={s.title}>
            <Box x={0} y={y} w={W} h={BH} accent={s.tone === "accent"} danger={s.tone === "danger"} />
            {numbered && (
              <T x={16} y={y + 39} size={18} head bold tone={s.tone === "danger" ? "danger" : "accent"}>
                {String(i + 1).padStart(2, "0")}
              </T>
            )}
            <T x={tx} y={y + 26} size={16.5} head bold>
              {s.title}
            </T>
            <T x={tx} y={y + 47} size={13.5} tone="muted">
              {s.sub}
            </T>
            {s.tag && (
              <T x={W - 14} y={y + 26} size={13} bold textAnchor="end" tone={s.tone === "danger" ? "danger" : "accent"}>
                {s.tag}
              </T>
            )}
            {i < steps.length - 1 && (
              <>
                <Arrow id={id} x1={34} y1={y + BH + 2} x2={34} y2={y + BH + GAP - 3} />
                {s.edge && (
                  <T x={46} y={y + BH + GAP / 2 + 5} size={12.5} tone="muted">
                    {s.edge}
                  </T>
                )}
              </>
            )}
          </g>
        );
      })}
    </Svg>
  );
}
