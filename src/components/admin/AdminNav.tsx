"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NewPill } from "./NewPill";
import { ADMIN_TABS, adminActive } from "./nav";

export { ADMIN_TABS };

/** Phones and tablets (< lg): one scrollable row of tabs. usePathname matches on server and client. */
export function AdminNav({ counts = {} }: { counts?: Record<string, number> }) {
  const path = usePathname() ?? "";
  return (
    <nav aria-label="Admin" className="-mx-4 overflow-x-auto border-b border-rule px-4 sm:-mx-6 sm:px-6 lg:hidden">
      <ul className="flex gap-1">
        {ADMIN_TABS.map(([href, label]) => {
          const on = adminActive(href, path);
          const fresh = (counts[href] ?? 0) > 0;
          return (
            <li key={href} className="shrink-0">
              <Link
                href={href}
                aria-current={on ? "page" : undefined}
                className={`flex items-center gap-2 whitespace-nowrap border-b-2 px-3 py-2.5 text-sm ${on ? "border-accent font-medium text-ink" : "border-transparent text-muted hover:text-ink"} ${fresh ? "!font-semibold !text-ink" : ""}`}
              >
                {label}
                <NewPill n={counts[href] ?? 0} />
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
