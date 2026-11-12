import type { ReactNode } from "react";
import Link from "next/link";

const RE = /`([^`]+)`|\*\*([^*]+)\*\*|\[([^\]]+)\]\(([^)\s]+)\)|\*([^*\s][^*]*?)\*/g;
const LINK = "font-medium text-ink underline decoration-accent/40 underline-offset-4 hover:decoration-accent";

/** Inline markdown: `code`, **bold**, *emphasis* and links. Internal links use next/link; outbound ones open in place. */
export function Inline({ text }: { text: string }) {
  const parts: ReactNode[] = [];
  let last = 0;
  for (const m of text.matchAll(RE)) {
    const i = m.index ?? 0;
    if (i > last) parts.push(text.slice(last, i));
    if (m[1] !== undefined) {
      parts.push(
        <code key={i} className="bg-ink/[0.06] px-1 py-0.5 font-mono text-[0.88em] text-ink [overflow-wrap:anywhere]">
          {m[1]}
        </code>,
      );
    } else if (m[2] !== undefined) {
      parts.push(
        <strong key={i} className="font-semibold text-ink">
          {m[2]}
        </strong>,
      );
    } else if (m[5] !== undefined) {
      parts.push(<em key={i}>{m[5]}</em>);
    } else {
      const href = m[4];
      parts.push(
        href.startsWith("/") ? (
          <Link key={i} href={href} className={LINK}>
            {m[3]}
          </Link>
        ) : (
          <a key={i} href={href} rel="noopener" className={LINK}>
            {m[3]}
          </a>
        ),
      );
    }
    last = i + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return <>{parts}</>;
}
