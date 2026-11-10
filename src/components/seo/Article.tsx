import type { ReactNode } from "react";
import Link from "next/link";
import type { ArticleSection } from "./types";

/** Simple markdown links: [label](/path) or [label](https://host/path). */
function Rich({ text }: { text: string }) {
  const re = /\[([^\]]+)\]\((\/[a-z0-9./#?=_-]*|https:\/\/[a-z0-9.-]+(?:\/[a-zA-Z0-9./_-]*)?)\)/g;
  const parts: ReactNode[] = [];
  let last = 0;
  for (const m of text.matchAll(re)) {
    const i = m.index ?? 0;
    if (i > last) parts.push(text.slice(last, i));
    const href = m[2];
    const label = m[1];
    const cls = "text-ink underline decoration-rule underline-offset-4 hover:decoration-ink";
    parts.push(
      href.startsWith("http") ? (
        <a key={i} href={href} rel="noopener noreferrer" className={cls}>{label}</a>
      ) : (
        <Link key={i} href={href} className={cls}>{label}</Link>
      ),
    );
    last = i + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return <>{parts}</>;
}

/** Long-form explainer under a tool or feature: plain, server-rendered HTML for crawlers and readers. */
export function Article({ sections }: { sections: ArticleSection[] }) {
  return (
    <div className="space-y-12">
      {sections.map((s) => (
        <section key={s.h}>
          <h2 className="font-display text-2xl font-medium tracking-tight text-ink sm:text-[1.7rem]">{s.h}</h2>
          {s.p?.map((t) => (
            <p key={t.slice(0, 40)} className="mt-4 text-base leading-relaxed text-muted">
              <Rich text={t} />
            </p>
          ))}
          {s.list && (
            <ul className="mt-4 space-y-2.5">
              {s.list.map((t) => (
                <li key={t.slice(0, 40)} className="flex gap-3 text-base leading-relaxed text-muted">
                  <span aria-hidden className="mt-[0.6rem] h-1.5 w-1.5 shrink-0 bg-accent" />
                  <span><Rich text={t} /></span>
                </li>
              ))}
            </ul>
          )}
          {s.steps && (
            <ol className="mt-4 space-y-3">
              {s.steps.map((t, i) => (
                <li key={t.slice(0, 40)} className="flex gap-3 text-base leading-relaxed text-muted">
                  <span className="mt-0.5 font-display text-sm font-medium text-accent">{String(i + 1).padStart(2, "0")}</span>
                  <span><Rich text={t} /></span>
                </li>
              ))}
            </ol>
          )}
          {s.code && (
            <pre className="mt-4 overflow-x-auto border border-rule bg-surface p-4 text-[13px] leading-relaxed text-ink">
              <code>{s.code}</code>
            </pre>
          )}
        </section>
      ))}
    </div>
  );
}
