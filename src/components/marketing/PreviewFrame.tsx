import type { ReactNode } from "react";

/** Browser chrome around an inert product replica, matching DashboardReplica. */
export function PreviewFrame({ url, label, children }: { url: string; label: string; children: ReactNode }) {
  return (
    <div
      role="img"
      aria-label={label}
      className="relative border border-rule bg-bg shadow-[10px_10px_0_0_hsl(var(--accent)/0.14)]"
    >
      <div className="flex items-center gap-3 border-b border-rule bg-surface px-3 py-2.5 sm:px-4">
        <div className="flex shrink-0 gap-1.5" aria-hidden>
          {[0, 1, 2].map((i) => (
            <span key={i} className="h-2.5 w-2.5 rounded-full border border-rule bg-bg" />
          ))}
        </div>
        <div className="mx-auto flex min-w-0 max-w-sm flex-1 items-center justify-center gap-1.5 border border-rule bg-bg px-3 py-1 text-xs text-muted">
          <svg viewBox="0 0 24 24" className="h-3 w-3 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <rect x="5" y="11" width="14" height="10" />
            <path d="M8 11V8a4 4 0 0 1 8 0v3" />
          </svg>
          <span className="truncate">{url}</span>
        </div>
        <span className="hidden w-[42px] shrink-0 sm:block" aria-hidden />
      </div>
      <div className="pointer-events-none select-none overflow-hidden" aria-hidden>
        {children}
      </div>
    </div>
  );
}
