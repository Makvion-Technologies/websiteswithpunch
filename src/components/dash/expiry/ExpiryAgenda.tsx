import Link from "next/link";
import type { MonthGroup } from "@/lib/expiry/events";
import { urgency } from "@/lib/expiry/events";
import { inDays } from "@/components/dash/overview/format";

const BAR = { overdue: "bg-rose-500", soon: "bg-rose-500", month: "bg-amber-500", later: "bg-accent" } as const;
const RANK = ["overdue", "soon", "month", "later"] as const;
const TEXT = { overdue: "text-rose-700 dark:text-rose-300", soon: "text-rose-700 dark:text-rose-300", month: "text-amber-700 dark:text-amber-300", later: "text-muted" } as const;

/** 12-month strip (counts per month, jump links) and the agenda below it. */
export function ExpiryAgenda({ groups }: { groups: MonthGroup[] }) {
  const max = Math.max(1, ...groups.map((g) => g.events.length));
  return (
    <>
      <nav aria-label="Months" className="grid grid-cols-6 gap-px border border-rule bg-rule sm:grid-cols-12">
        {groups.map((g) => {
          const n = g.events.length;
          const worst = RANK[Math.min(3, ...g.events.map((e) => RANK.indexOf(urgency(e.daysLeft))))];
          return (
            <a key={g.key} href={n ? `#m-${g.key}` : undefined} className={`flex flex-col bg-surface px-2 py-2 ${n ? "hover:bg-bg" : "opacity-60"}`}>
              <span className="text-[11px] text-muted">{g.label.split(" ")[0]}</span>
              <span className="mt-1 flex h-8 items-end" aria-hidden>
                <span className={`w-full ${n ? BAR[worst] : "bg-ink/10"}`} style={{ height: `${n ? 20 + (n / max) * 80 : 8}%` }} />
              </span>
              <span className="mt-1 text-xs font-medium text-ink">{n || "–"}</span>
            </a>
          );
        })}
      </nav>
      <div className="mt-6 space-y-6">
        {groups
          .filter((g) => g.events.length)
          .map((g) => (
            <section key={g.key} id={`m-${g.key}`} className="scroll-mt-24">
              <h2 className="label-caps text-muted">{g.label}</h2>
              <ul className="mt-2 border border-rule bg-surface">
                {g.events.map((e) => {
                  const u = urgency(e.daysLeft);
                  return (
                    <li key={`${e.siteId}-${e.kind}`} className="flex items-center gap-3 border-b border-rule px-4 py-3 last:border-b-0">
                      <span className="w-12 shrink-0 text-center">
                        <span className="block font-display text-lg font-medium leading-5 text-ink">{e.date.slice(8, 10)}</span>
                        <span className="block text-[10px] uppercase tracking-wide text-muted">{e.kind === "ssl" ? "SSL" : "Domain"}</span>
                      </span>
                      <span className={`h-8 w-0.5 shrink-0 ${BAR[u]}`} aria-hidden />
                      <Link href={`/dashboard/sites/${e.siteId}`} className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-ink hover:text-accent">{e.siteName}</span>
                        <span className="block truncate text-xs text-muted">{e.host}</span>
                      </Link>
                      <span className={`shrink-0 text-xs font-medium ${TEXT[u]}`}>{inDays(e.daysLeft)}</span>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
      </div>
    </>
  );
}
