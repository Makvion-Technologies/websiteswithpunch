"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { searchSites, type SearchHit } from "@/content/is-down/search";

/**
 * Client-only type-ahead on the /is-down hub. The category lists below stay
 * server-rendered and are not filtered, so first paint and hydration stay in sync.
 */
export function IsDownSearch() {
  const router = useRouter();
  const uid = useId();
  const inputId = `${uid}-q`;
  const listId = `${uid}-list`;
  const rootRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const hits = searchSites(query);
  const q = query.trim();
  const show = open && q.length > 0;

  function go(host: string) {
    router.push(`/is-down/${host}`);
  }

  function onChange(value: string) {
    setQuery(value);
    setActive(0);
    setOpen(true);
  }

  function onKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      if (hits.length) setActive((i) => (i + 1) % hits.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setOpen(true);
      if (hits.length) setActive((i) => (i - 1 + hits.length) % hits.length);
    } else if (e.key === "Home" && show && hits.length) {
      e.preventDefault();
      setActive(0);
    } else if (e.key === "End" && show && hits.length) {
      e.preventDefault();
      setActive(hits.length - 1);
    } else if (e.key === "Escape") {
      e.preventDefault();
      if (open) setOpen(false);
      else setQuery("");
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const hit = hits[active] ?? hits[0];
    if (hit) go(hit.host);
  }

  return (
    <div ref={rootRef} className="relative mt-8">
      <form onSubmit={onSubmit} autoComplete="off">
        <label htmlFor={inputId} className="text-sm font-medium text-ink">
          Search sites
        </label>
        <div className="relative mt-2">
          <svg
            aria-hidden
            viewBox="0 0 16 16"
            fill="none"
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
          >
            <circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M10 10l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <input
            id={inputId}
            type="text"
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={show}
            aria-controls={listId}
            aria-activedescendant={show && hits[active] ? `${listId}-${active}` : undefined}
            autoComplete="off"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            placeholder="Instagram, SBI, IRCTC…"
            value={query}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={onKey}
            onFocus={() => setOpen(true)}
            onBlur={(e) => {
              if (!rootRef.current?.contains(e.relatedTarget as Node)) setOpen(false);
            }}
            className="block w-full rounded-none border border-rule bg-bg py-3 pl-10 pr-3 text-base text-ink placeholder:text-muted/70 outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
          />
        </div>
      </form>
      <div
        id={listId}
        hidden={!show}
        className="absolute z-20 mt-1 w-full border border-rule bg-bg shadow-lg"
      >
        {show && hits.length > 0 && (
          <ul role="listbox" aria-label="Matching sites">
            {hits.map((hit, i) => (
              <li key={hit.host} role="presentation">
                <ResultLink
                  hit={hit}
                  id={`${listId}-${i}`}
                  active={i === active}
                  onActive={() => setActive(i)}
                />
              </li>
            ))}
          </ul>
        )}
        {show && hits.length === 0 && <EmptyState query={q} />}
      </div>
    </div>
  );
}

function ResultLink({
  hit,
  id,
  active,
  onActive,
}: {
  hit: SearchHit;
  id: string;
  active: boolean;
  onActive: () => void;
}) {
  return (
    <Link
      id={id}
      role="option"
      aria-selected={active}
      href={`/is-down/${hit.host}`}
      onMouseEnter={onActive}
      onMouseDown={(e) => e.preventDefault()}
      className={`block px-3 py-2.5 ${active ? "bg-accent-soft" : "bg-bg hover:bg-surface"}`}
    >
      <span className="font-display text-sm font-medium text-ink">Is {hit.name} down?</span>
      <span className="mt-0.5 block truncate text-xs text-muted">
        {hit.host} · {hit.catLabel}
      </span>
    </Link>
  );
}

function EmptyState({ query }: { query: string }) {
  const shown = query.length > 40 ? `${query.slice(0, 40)}…` : query;
  return (
    <p className="px-3 py-3 text-sm leading-relaxed text-muted">
      No sites match “{shown}”. Check any address with the{" "}
      <Link
        href="/tools/website-down-checker"
        className="text-ink underline decoration-rule underline-offset-4 hover:decoration-ink"
      >
        website down checker
      </Link>
      .
    </p>
  );
}
