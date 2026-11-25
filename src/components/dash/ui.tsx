import Link from "next/link";
import type { ReactNode } from "react";
import { DashIcon, type DashIconName } from "./icons";

/** Shared dashboard page pieces: header, section card, empty state, buttons. */
export const BTN_PRIMARY =
  "inline-flex items-center justify-center gap-2 bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";
export const BTN_SECONDARY =
  "inline-flex items-center justify-center gap-2 border border-rule bg-surface px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-ink/25 disabled:opacity-60";
export const BTN_GHOST = "inline-flex items-center gap-1.5 px-2 py-1 text-sm text-muted transition-colors hover:bg-ink/[0.05] hover:text-ink disabled:opacity-60";
export const FIELD = "mt-1 w-full border border-rule bg-bg px-3 py-2 text-sm text-ink placeholder:text-muted/70 focus:border-accent focus:outline-none";
export const ERROR = "bg-danger/10 px-3 py-2 text-sm text-danger";

export function PageHeader({ title, description, actions }: { title: string; description?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <h1 className="font-display text-2xl font-medium text-ink">{title}</h1>
        {description && <p className="mt-1 max-w-2xl text-sm text-muted">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Panel({ title, action, children, className = "" }: { title?: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`border border-rule bg-surface ${className}`}>
      {title && (
        <header className="flex items-center justify-between gap-3 border-b border-rule px-4 py-3">
          <h2 className="font-display text-sm font-medium text-ink">{title}</h2>
          {action}
        </header>
      )}
      {children}
    </section>
  );
}

/** One clear call to action, a one-line why, and an icon that names the section. */
export function EmptyState({ icon, title, text, action }: { icon: DashIconName; title: string; text: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center border border-dashed border-rule px-6 py-12 text-center">
      <span className="flex h-11 w-11 items-center justify-center bg-accent-soft text-accent">
        <DashIcon name={icon} className="h-5 w-5" />
      </span>
      <h2 className="mt-4 font-display text-lg font-medium text-ink">{title}</h2>
      <p className="mt-1.5 max-w-md text-sm text-muted">{text}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function TextLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="text-sm font-medium text-accent hover:underline">
      {children}
    </Link>
  );
}
