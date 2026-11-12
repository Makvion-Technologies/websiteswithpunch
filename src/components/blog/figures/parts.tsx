import type { ReactNode, SVGProps } from "react";

/**
 * Building blocks for blog diagrams. Every colour is a theme token class (fill-ink, stroke-rule,
 * fill-accent…), so diagrams follow the light/dark toggle exactly like the rest of the page.
 */
export function Svg({ id, w, h, title, desc, children }: { id: string; w: number; h: number; title: string; desc: string; children: ReactNode }) {
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h} role="img" aria-labelledby={`${id}-t ${id}-d`} className="block h-auto w-full font-body">
      <title id={`${id}-t`}>{title}</title>
      <desc id={`${id}-d`}>{desc}</desc>
      <defs>
        <marker id={`${id}-arrow`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0 0L10 5L0 10z" className="fill-muted" />
        </marker>
      </defs>
      {children}
    </svg>
  );
}

type TP = SVGProps<SVGTextElement> & { x: number; y: number; size?: number; tone?: "ink" | "muted" | "accent" | "danger"; bold?: boolean; head?: boolean };

const TONE = { ink: "fill-ink", muted: "fill-muted", accent: "fill-accent", danger: "fill-danger" } as const;

export function T({ x, y, size = 16, tone = "ink", bold, head, children, className = "", ...rest }: TP) {
  return (
    <text x={x} y={y} fontSize={size} fontWeight={bold ? 600 : 400} className={`${TONE[tone]} ${head ? "font-display" : ""} ${className}`} {...rest}>
      {children}
    </text>
  );
}

/** A labelled box: thin rule border on the surface colour, or a soft accent fill. */
export function Box({ x, y, w, h, accent, danger }: { x: number; y: number; w: number; h: number; accent?: boolean; danger?: boolean }) {
  const cls = danger ? "fill-danger/10 stroke-danger" : accent ? "fill-accent/10 stroke-accent" : "fill-bg stroke-ink/20";
  return <rect x={x + 0.5} y={y + 0.5} width={w - 1} height={h - 1} className={cls} strokeWidth={1} />;
}

/** Straight arrow from (x1,y1) to (x2,y2) using the figure's marker. */
export function Arrow({ id, x1, y1, x2, y2, dashed }: { id: string; x1: number; y1: number; x2: number; y2: number; dashed?: boolean }) {
  return (
    <line x1={x1} y1={y1} x2={x2} y2={y2} className="stroke-muted" strokeWidth={1.5} strokeDasharray={dashed ? "5 4" : undefined} markerEnd={`url(#${id}-arrow)`} />
  );
}
