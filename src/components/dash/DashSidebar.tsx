"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { DashIcon } from "./icons";
import { isActive, type DashNavGroup } from "./nav-items";

export type PlanBox = { planName: string; used: number; limit: number; upgrade: boolean; noPlan?: boolean; trial?: boolean };

/** Desktop left rail (lg+). Sticky under the navbar; the active item gets the accent bar. */
export function DashSidebar({ groups, plan }: { groups: DashNavGroup[]; plan: PlanBox }) {
  const path = usePathname() ?? "";
  const pct = Math.min(100, Math.round((plan.used / Math.max(1, plan.limit)) * 100));
  return (
    <aside className="sticky top-[65px] hidden h-[calc(100dvh-65px)] flex-col overflow-y-auto border-r border-rule py-6 pr-4 lg:flex">
      <nav aria-label="Dashboard" className="flex-1 space-y-6">
        {groups.map((g) => (
          <div key={g.label}>
            <p className="label-caps px-3 text-muted">{g.label}</p>
            <ul className="mt-1.5 space-y-0.5">
              {g.items.map((item) => {
                const on = isActive(item, path);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={on ? "page" : undefined}
                      className={`flex items-center gap-2.5 border-l-2 px-3 py-2 text-sm transition-colors ${
                        on ? "border-accent bg-accent-soft font-medium text-ink" : "border-transparent text-muted hover:bg-ink/[0.04] hover:text-ink"
                      }`}
                    >
                      <DashIcon name={item.icon} className={`h-[18px] w-[18px] shrink-0 ${on ? "text-accent" : ""}`} />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
      <div className="mt-6 border border-rule bg-surface p-3">
        <p className="flex items-baseline justify-between text-xs text-muted">
          <span className="font-medium text-ink">{plan.noPlan ? "No plan yet" : `${plan.planName} ${plan.trial ? "trial" : "plan"}`}</span>
          <span>
            {plan.used}/{plan.limit} sites
          </span>
        </p>
        <div className="mt-2 h-1 bg-ink/10" aria-hidden>
          <div className="h-1 bg-accent" style={{ width: `${pct}%` }} />
        </div>
        <Link href="/plan" className="mt-2.5 inline-block text-xs font-medium text-accent hover:underline">
          {plan.noPlan ? "Choose a plan →" : plan.upgrade ? "Upgrade plan →" : "Manage plan →"}
        </Link>
      </div>
    </aside>
  );
}
