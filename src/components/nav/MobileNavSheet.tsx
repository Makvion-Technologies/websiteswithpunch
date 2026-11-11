"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { NAV_MENUS, NAV_PRICING } from "./nav-data";
import { FOCUS_RING } from "./NavDropdown";
import { NavIcon } from "./nav-icons";

const FOCUSABLE = 'a[href],button:not([disabled])';

/** Full-screen mobile menu: the same sections as the desktop dropdowns, as accordions. */
export function MobileNavSheet({ onClose }: { onClose: () => void }) {
  const [section, setSection] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => closeRef.current?.focus(), []);

  function onKey(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === "Escape") {
      e.preventDefault();
      onClose();
      return;
    }
    if (e.key !== "Tab") return;
    const items = Array.from(rootRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []).filter(
      (el) => el.offsetParent !== null,
    );
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last?.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first?.focus();
    }
  }

  const row = `flex min-h-12 w-full items-center justify-between border-b border-rule px-4 text-left font-display text-base font-medium text-ink ${FOCUS_RING}`;

  return (
    <div
      ref={rootRef}
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
      onKeyDown={onKey}
      className="fixed inset-0 z-[70] flex flex-col bg-bg"
    >
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-rule px-4 sm:px-6">
        <Link href="/" onClick={onClose} className={`flex min-w-0 items-center gap-2 font-display text-sm font-medium text-ink ${FOCUS_RING}`}>
          <Image src="/logo.svg" alt="" width={28} height={28} unoptimized className="h-7 w-7 shrink-0 object-contain" />
          <span className="truncate">Websites With Punch</span>
        </Link>
        <button
          ref={closeRef}
          type="button"
          aria-label="Close menu"
          onClick={onClose}
          className={`inline-flex h-8 w-8 items-center justify-center border border-rule text-ink hover:bg-accent-soft ${FOCUS_RING}`}
        >
          <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 6l12 12M18 6 6 18" />
          </svg>
        </button>
      </div>
      <nav aria-label="Main" className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        {NAV_MENUS.map((m) => {
          const open = section === m.id;
          return (
            <div key={m.id}>
              <button
                type="button"
                aria-expanded={open}
                aria-controls={`m-nav-${m.id}`}
                onClick={() => setSection(open ? null : m.id)}
                className={row}
              >
                {m.label}
                <svg aria-hidden viewBox="0 0 12 12" className={`h-3.5 w-3.5 text-muted transition-transform ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="1.6">
                  <path d="M3 4.5 6 7.5l3-3" />
                </svg>
              </button>
              <ul id={`m-nav-${m.id}`} className={`border-b border-rule bg-surface py-1 ${open ? "" : "hidden"}`}>
                {m.items.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} onClick={onClose} className={`flex gap-3 px-4 py-3 hover:bg-accent-soft ${FOCUS_RING}`}>
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center border border-rule bg-bg text-accent">
                        <NavIcon name={item.icon} />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-sm font-medium text-ink">{item.title}</span>
                        <span className="mt-0.5 block text-xs leading-snug text-muted">{item.desc}</span>
                      </span>
                    </Link>
                  </li>
                ))}
                {m.footer && (
                  <li>
                    <Link href={m.footer.href} onClick={onClose} className={`block px-4 py-3 text-sm font-medium text-accent ${FOCUS_RING}`}>
                      {m.footer.label} →
                    </Link>
                  </li>
                )}
              </ul>
            </div>
          );
        })}
        <Link href={NAV_PRICING.href} onClick={onClose} className={row}>
          {NAV_PRICING.label}
        </Link>
      </nav>
      <div className="grid shrink-0 grid-cols-2 gap-2 border-t border-rule p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <Link href="/login" onClick={onClose} className={`flex min-h-11 items-center justify-center border border-rule text-sm font-medium text-ink hover:bg-accent-soft ${FOCUS_RING}`}>
          Log in
        </Link>
        <Link href="/signup" onClick={onClose} className={`flex min-h-11 items-center justify-center bg-accent text-sm font-medium text-white hover:bg-accent-hover ${FOCUS_RING}`}>
          Start free
        </Link>
      </div>
    </div>
  );
}
