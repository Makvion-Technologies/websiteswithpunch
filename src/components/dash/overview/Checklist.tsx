"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { DashboardAddSiteButton } from "@/components/DashboardAddSiteButton";
import type { Setup } from "@/lib/overview";

type Step = { key: keyof Setup; title: string; text: string; href?: string; cta: string };

/** Getting started: one action per step; disappears when every step is done or it is hidden. */
export function Checklist({ setup, cron, atLimit }: { setup: Setup; cron: boolean; atLimit: boolean }) {
  const router = useRouter();
  const [hiding, setHiding] = useState(false);
  const steps: Step[] = [
    { key: "sites", title: "Add your first site", text: "We check uptime, the SSL certificate and the domain expiry date.", cta: "Add site" },
    { key: "channels", title: "Choose where alerts go", text: "Email is on. Add Slack, Discord, Telegram or a webhook too.", href: "/dashboard/alerts", cta: "Set up alerts" },
    { key: "statusPage", title: "Publish a status page", text: "A public page your visitors or clients can check during an outage.", href: "/dashboard/status-pages", cta: "Create page" },
    { key: "report", title: "Get a weekly report", text: "Uptime, incidents and upcoming expiries in one email a week.", href: "/dashboard/reports", cta: "Turn on" },
    ...(cron ? [{ key: "cron" as const, title: "Watch a cron job", text: "Get told when a backup or scheduled task stops running.", href: "/dashboard/cron-jobs", cta: "Add cron job" }] : []),
  ];
  const done = steps.filter((s) => setup[s.key]).length;
  if (done === steps.length) return null;

  async function hide() {
    setHiding(true);
    await fetch("/api/onboarding", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ dismissed: true }) }).catch(() => undefined);
    router.refresh();
  }

  return (
    <section className="border border-rule bg-surface" aria-label="Getting started">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-rule px-4 py-3">
        <div>
          <h2 className="font-display text-base font-medium text-ink">Get set up</h2>
          <p className="text-xs text-muted">
            {done} of {steps.length} done · takes about 3 minutes
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden h-1.5 w-32 bg-ink/10 sm:block" aria-hidden>
            <div className="h-1.5 bg-accent transition-all" style={{ width: `${(done / steps.length) * 100}%` }} />
          </div>
          <button type="button" onClick={hide} disabled={hiding} className="text-xs text-muted hover:text-ink disabled:opacity-60">
            {hiding ? "Hiding…" : "Hide"}
          </button>
        </div>
      </header>
      <ol>
        {steps.map((s, i) => {
          const ok = setup[s.key];
          return (
            <li key={s.key} className="flex items-center gap-3 border-b border-rule px-4 py-3 last:border-b-0">
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center text-xs font-medium ${ok ? "bg-emerald-600 text-white dark:bg-emerald-500" : "border border-rule text-muted"}`}
                aria-hidden
              >
                {ok ? "✓" : i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className={`text-sm font-medium ${ok ? "text-muted line-through decoration-muted/50" : "text-ink"}`}>{s.title}</p>
                {!ok && <p className="text-xs text-muted">{s.text}</p>}
              </div>
              {!ok &&
                (s.href ? (
                  <Link href={s.href} className="shrink-0 border border-rule px-3 py-1.5 text-xs font-medium text-ink hover:border-accent hover:text-accent">
                    {s.cta}
                  </Link>
                ) : (
                  <DashboardAddSiteButton atLimit={atLimit} label={s.cta} variant="accent" />
                ))}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
