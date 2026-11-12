type H = { id: string; text: string };

/** "On this page" list. Plain anchor links: no client JS, so nothing to hydrate. */
export function Toc({ items }: { items: H[] }) {
  return (
    <nav aria-labelledby="toc-title">
      <h2 id="toc-title" className="label-caps text-muted">
        On this page
      </h2>
      <ol className="mt-3 border-l border-rule">
        {items.map((h) => (
          <li key={h.id}>
            <a href={`#${h.id}`} className="-ml-px block border-l border-transparent py-1.5 pl-4 text-sm leading-snug text-muted hover:border-accent hover:text-ink">
              {h.text}
            </a>
          </li>
        ))}
        <li>
          <a href="#faq-title" className="-ml-px block border-l border-transparent py-1.5 pl-4 text-sm leading-snug text-muted hover:border-accent hover:text-ink">
            FAQ
          </a>
        </li>
      </ol>
    </nav>
  );
}

/** Collapsed contents for phones and tablets, where the sidebar sits below the article. */
export function MobileToc({ items }: { items: H[] }) {
  return (
    <details className="group mt-8 border border-rule bg-surface lg:hidden">
      <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between px-4 text-sm font-medium text-ink [&::-webkit-details-marker]:hidden">
        On this page
        <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4 text-muted transition-transform group-open:rotate-180" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </summary>
      <ol className="border-t border-rule px-4 py-2">
        {items.map((h) => (
          <li key={h.id}>
            <a href={`#${h.id}`} className="block py-1.5 text-sm text-muted hover:text-ink">
              {h.text}
            </a>
          </li>
        ))}
      </ol>
    </details>
  );
}
