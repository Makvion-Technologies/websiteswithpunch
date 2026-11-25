"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { DashIcon } from "./icons";
import { MOBILE_PRIMARY, MOBILE_SHORT, isActive, type DashNavGroup } from "./nav-items";

const TAB = "flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 text-[11px] font-medium";

/** Phones and tablets (< lg): fixed bottom bar with 4 destinations and a More sheet for the rest. */
export function DashMobileNav({ groups }: { groups: DashNavGroup[] }) {
  const path = usePathname() ?? "";
  const [open, setOpen] = useState(false);
  const all = groups.flatMap((g) => g.items);
  const primary = MOBILE_PRIMARY.map((h) => all.find((i) => i.href === h)!).filter(Boolean);
  const rest = all.filter((i) => !MOBILE_PRIMARY.includes(i.href));
  const moreActive = rest.some((i) => isActive(i, path));

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="dash-mobile-nav lg:hidden">
      {open && (
        <div className="fixed inset-0 z-40" role="presentation" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-solid/30" aria-hidden />
          <div
            role="dialog"
            aria-label="More dashboard pages"
            className="absolute inset-x-0 bottom-[calc(56px+env(safe-area-inset-bottom))] border-t border-rule bg-bg p-2 shadow-[0_-12px_32px_-12px_rgb(0_0_0/0.25)]"
            onClick={(e) => e.stopPropagation()}
          >
            <ul>
              {rest.map((i) => {
                const on = isActive(i, path);
                return (
                  <li key={i.href}>
                    <Link href={i.href} onClick={() => setOpen(false)} className={`flex min-h-12 items-center gap-3 px-3 text-sm ${on ? "bg-accent-soft font-medium text-ink" : "text-ink"}`}>
                      <DashIcon name={i.icon} className={`h-5 w-5 ${on ? "text-accent" : "text-muted"}`} />
                      {i.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}
      <nav
        aria-label="Dashboard"
        className="fixed inset-x-0 bottom-0 z-40 flex border-t border-rule bg-bg/95 pb-[env(safe-area-inset-bottom)] backdrop-blur"
      >
        {primary.map((i) => {
          const on = isActive(i, path);
          return (
            <Link key={i.href} href={i.href} onClick={() => setOpen(false)} aria-current={on ? "page" : undefined} className={`${TAB} ${on ? "text-accent" : "text-muted"}`}>
              <DashIcon name={i.icon} className="h-5 w-5" />
              {MOBILE_SHORT[i.href] ?? i.label}
            </Link>
          );
        })}
        <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} className={`${TAB} ${open || moreActive ? "text-accent" : "text-muted"}`}>
          <DashIcon name="more" className="h-5 w-5" />
          More
        </button>
      </nav>
    </div>
  );
}
