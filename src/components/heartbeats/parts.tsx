"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import type { ClientHb } from "@/lib/heartbeats/types";

/** Ticking clock that starts at the server's time, so the first render matches (no hydration drift). */
export function useNow(serverNow: number, everyMs = 30_000) {
  const [now, setNow] = useState(serverNow);
  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), everyMs);
    return () => clearInterval(t);
  }, [everyMs]);
  return now;
}

/** "just now", "4 min ago", "in 12 min", "in 3 h", "2 d ago". */
export function rel(ts: number, now: number): string {
  const d = ts - now;
  const a = Math.abs(d);
  const m = Math.round(a / 60_000);
  const txt = a < 45_000 ? "" : m < 60 ? `${m} min` : m < 48 * 60 ? `${Math.round(m / 60)} h` : `${Math.round(m / 1440)} d`;
  if (!txt) return d < 0 ? "just now" : "any moment";
  return d < 0 ? `${txt} ago` : `in ${txt}`;
}

const BADGE: Record<ClientHb["state"], [string, string, string]> = {
  up: ["Up", "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-400/15 dark:text-emerald-300 dark:ring-emerald-400/30", "bg-emerald-500"],
  down: ["Missed", "bg-rose-50 text-rose-700 ring-rose-600/20 dark:bg-rose-400/15 dark:text-rose-300 dark:ring-rose-400/30", "bg-rose-500"],
  waiting: ["Waiting for first ping", "bg-accent-soft text-muted ring-rule", "bg-accent"],
  paused: ["Paused", "bg-accent-soft text-muted ring-rule", "bg-muted"],
  over: ["Over plan limit", "bg-amber-50 text-amber-800 ring-amber-600/20 dark:bg-amber-400/15 dark:text-amber-200 dark:ring-amber-400/30", "bg-amber-500"],
};

export function HbBadge({ state }: { state: ClientHb["state"] }) {
  const [label, cls, dot] = BADGE[state];
  return (
    <span className={cn("inline-flex shrink-0 items-center px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset", cls)}>
      <span className={cn("mr-1.5 h-1.5 w-1.5 rounded-full", dot)} />
      {label}
    </span>
  );
}

/** One line of code with a Copy button; scrolls sideways on small screens instead of wrapping. */
export function CopyLine({ text, label }: { text: string; label: string }) {
  const [done, setDone] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setDone(true);
      setTimeout(() => setDone(false), 1500);
    } catch {
      /* clipboard blocked: the text is selectable */
    }
  }
  return (
    <div className="flex min-w-0 items-stretch border border-rule bg-bg">
      <code className="min-w-0 flex-1 overflow-x-auto whitespace-nowrap px-3 py-2 font-mono text-xs text-ink [scrollbar-width:thin]">{text}</code>
      <button
        type="button"
        onClick={copy}
        aria-label={`Copy ${label}`}
        className="shrink-0 border-l border-rule px-3 text-xs font-medium text-accent hover:bg-accent-soft"
      >
        {done ? "Copied" : "Copy"}
      </button>
    </div>
  );
}

export function Metric({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="min-w-0 border border-rule bg-surface px-3 py-2">
      <p className="text-xs text-muted">{label}</p>
      <p className="truncate text-sm font-medium text-ink">{value}</p>
      {sub && <p className="truncate text-[11px] text-muted">{sub}</p>}
    </div>
  );
}
