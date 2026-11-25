"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AdminIcon } from "./icons";
import { ADMIN_NAV, adminActive } from "./nav";
import { NewPill } from "./NewPill";

/** Desktop rail (lg+), sticky under the navbar, same look as the customer dashboard rail. */
export function AdminSidebar({ counts = {} }: { counts?: Record<string, number> }) {
  const path = usePathname() ?? "";
  return (
    <aside className="sticky top-[65px] hidden h-[calc(100dvh-65px)] flex-col overflow-y-auto border-r border-rule py-6 pr-4 lg:flex">
      <p className="px-3 font-display text-sm font-medium text-ink">Admin</p>
      <nav aria-label="Admin" className="mt-5 flex-1 space-y-6">
        {ADMIN_NAV.map((g) => (
          <div key={g.label}>
            <p className="label-caps px-3 text-muted">{g.label}</p>
            <ul className="mt-1.5 space-y-0.5">
              {g.items.map((item) => {
                const on = adminActive(item.href, path);
                const n = counts[item.href] ?? 0;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={on ? "page" : undefined}
                      className={`flex items-center gap-2.5 border-l-2 px-3 py-2 text-sm transition-colors ${on ? "border-accent bg-accent-soft font-medium text-ink" : "border-transparent text-muted hover:bg-ink/[0.04] hover:text-ink"} ${n > 0 ? "!font-semibold !text-ink" : ""}`}
                    >
                      <AdminIcon name={item.icon} className={`h-[18px] w-[18px] shrink-0 ${on ? "text-accent" : ""}`} />
                      <span className="min-w-0 flex-1 truncate">{item.label}</span>
                      <NewPill n={n} />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
      <p className="mt-6 px-3 text-[11px] leading-relaxed text-muted">Hidden from search engines. Every page checks admin access on the server.</p>
    </aside>
  );
}
