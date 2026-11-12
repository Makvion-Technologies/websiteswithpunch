import type { Block } from "@/lib/blog/markdown";
import { Figure } from "./figures";
import { Inline } from "./Inline";

const P = "mt-5 text-base leading-[1.75] text-ink/80 sm:text-[1.0625rem]";

/** Long-read body for a blog post: server-rendered HTML from the parsed markdown blocks. */
export function Prose({ blocks }: { blocks: Block[] }) {
  return (
    <div className="min-w-0">
      {blocks.map((b, k) => {
        switch (b.t) {
          case "h2":
            return (
              <h2 key={k} id={b.id} className="mt-14 scroll-mt-24 break-words font-display text-2xl font-medium tracking-tight text-ink first:mt-0 sm:text-[1.7rem]">
                <Inline text={b.text} />
              </h2>
            );
          case "h3":
            return (
              <h3 key={k} id={b.id} className="mt-9 scroll-mt-24 break-words font-display text-lg font-medium tracking-tight text-ink sm:text-xl">
                <Inline text={b.text} />
              </h3>
            );
          case "p":
            return (
              <p key={k} className={P}>
                <Inline text={b.text} />
              </p>
            );
          case "ul":
            return (
              <ul key={k} className="mt-5 space-y-2.5">
                {b.items.map((t, i) => (
                  <li key={i} className="flex gap-3 text-base leading-[1.7] text-ink/80 sm:text-[1.0625rem]">
                    <span aria-hidden className="mt-[0.7rem] h-1.5 w-1.5 shrink-0 bg-accent" />
                    <span className="min-w-0">
                      <Inline text={t} />
                    </span>
                  </li>
                ))}
              </ul>
            );
          case "ol":
            return (
              <ol key={k} className="mt-5 space-y-3">
                {b.items.map((t, i) => (
                  <li key={i} className="flex gap-3 text-base leading-[1.7] text-ink/80 sm:text-[1.0625rem]">
                    <span aria-hidden className="mt-[0.2rem] w-6 shrink-0 font-display text-sm font-medium tabular-nums text-accent">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="min-w-0">
                      <Inline text={t} />
                    </span>
                  </li>
                ))}
              </ol>
            );
          case "code":
            return (
              <div key={k} className="mt-6 border border-rule bg-surface">
                {b.lang && <p className="label-caps border-b border-rule px-4 py-2">{b.lang}</p>}
                <pre className="overflow-x-auto p-4 font-mono text-[13px] leading-relaxed text-ink">
                  <code>{b.code}</code>
                </pre>
              </div>
            );
          case "table":
            return (
              <div key={k} className="mt-6 overflow-x-auto border border-rule bg-surface">
                <table className="w-full min-w-[30rem] border-collapse text-left text-sm">
                  <thead>
                    <tr>
                      {b.head.map((h, i) => (
                        <th key={i} scope="col" className="border-b border-rule px-4 py-3 font-medium text-ink">
                          <Inline text={h} />
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {b.rows.map((r, i) => (
                      <tr key={i} className="border-t border-rule first:border-t-0">
                        {r.map((c, j) => (
                          <td key={j} className={`px-4 py-3 align-top leading-relaxed ${j === 0 ? "text-ink" : "text-ink/75"}`}>
                            <Inline text={c} />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          case "callout":
            return (
              <aside key={k} className="mt-6 border border-rule border-l-accent bg-accent-soft px-5 py-4" style={{ borderLeftWidth: 3 }}>
                <p className="label-caps !text-ink">{b.label}</p>
                {b.text.map((t, i) => (
                  <p key={i} className="mt-1.5 text-[0.95rem] leading-relaxed text-ink">
                    <Inline text={t} />
                  </p>
                ))}
              </aside>
            );
          case "fig":
            return <Figure key={k} name={b.name} />;
        }
      })}
    </div>
  );
}
