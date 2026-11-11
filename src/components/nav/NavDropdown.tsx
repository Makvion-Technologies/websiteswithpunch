"use client";

import Link from "next/link";
import { useEffect, useRef, type KeyboardEvent } from "react";
import type { NavMenu } from "./nav-data";
import { NavIcon } from "./nav-icons";

export const FOCUS_RING =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

type Props = {
  menu: NavMenu;
  open: boolean;
  /** Ask the panel to move focus to its first link once it is open (keyboard ArrowDown). */
  focusFirst: boolean;
  onTriggerClick: () => void;
  onOpenKeyboard: () => void;
  onClose: () => void;
  onHover: (inside: boolean) => void;
};

/**
 * One navbar dropdown. The panel is always in the DOM (hidden when closed) so links are crawlable
 * and opening it never shifts layout: it is absolutely positioned under the trigger.
 */
export function NavDropdown({ menu, open, focusFirst, onTriggerClick, onOpenKeyboard, onClose, onHover }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelId = `nav-panel-${menu.id}`;

  const links = () => Array.from(rootRef.current?.querySelectorAll<HTMLAnchorElement>("[data-nav-item]") ?? []);

  useEffect(() => {
    if (open && focusFirst) links()[0]?.focus();
  }, [open, focusFirst]);

  function closeToTrigger() {
    onClose();
    triggerRef.current?.focus();
  }

  function onTriggerKey(e: KeyboardEvent<HTMLButtonElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      onOpenKeyboard();
    } else if (e.key === "Escape" && open) {
      e.preventDefault();
      onClose();
    }
  }

  function onPanelKey(e: KeyboardEvent<HTMLDivElement>) {
    const items = links();
    const i = items.indexOf(document.activeElement as HTMLAnchorElement);
    if (e.key === "Escape") {
      e.preventDefault();
      closeToTrigger();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      items[(i + 1) % items.length]?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      items[(i - 1 + items.length) % items.length]?.focus();
    } else if (e.key === "Home") {
      e.preventDefault();
      items[0]?.focus();
    } else if (e.key === "End") {
      e.preventDefault();
      items[items.length - 1]?.focus();
    }
  }

  return (
    <div
      ref={rootRef}
      className="relative"
      onPointerEnter={(e) => e.pointerType === "mouse" && onHover(true)}
      onPointerLeave={(e) => e.pointerType === "mouse" && onHover(false)}
      onBlur={(e) => {
        if (open && !rootRef.current?.contains(e.relatedTarget as Node | null)) onClose();
      }}
    >
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={onTriggerClick}
        onKeyDown={onTriggerKey}
        className={`inline-flex items-center gap-1 px-3 py-1.5 text-ink hover:bg-accent-soft ${open ? "bg-accent-soft" : ""} ${FOCUS_RING}`}
      >
        {menu.label}
        <svg aria-hidden viewBox="0 0 12 12" className={`h-3 w-3 text-muted transition-transform ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M3 4.5 6 7.5l3-3" />
        </svg>
      </button>
      <div id={panelId} className={`absolute left-0 top-full z-50 pt-2 ${open ? "" : "hidden"}`} onKeyDown={onPanelKey}>
        <div className="w-[380px] border border-rule bg-surface shadow-lg xl:w-[580px]">
          <ul className="grid gap-px p-2 xl:grid-cols-2">
            {menu.items.map((item) => (
              <li key={item.href}>
                <Link
                  data-nav-item
                  href={item.href}
                  onClick={onClose}
                  className={`group flex gap-3 p-3 hover:bg-accent-soft focus-visible:bg-accent-soft ${FOCUS_RING}`}
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center border border-rule bg-bg text-accent">
                    <NavIcon name={item.icon} />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-medium text-ink group-hover:text-accent">{item.title}</span>
                    <span className="mt-0.5 block text-xs leading-snug text-muted">{item.desc}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          {menu.footer && (
            <Link
              data-nav-item
              href={menu.footer.href}
              onClick={onClose}
              className={`flex items-center justify-between border-t border-rule px-5 py-3 text-sm font-medium text-accent hover:bg-accent-soft ${FOCUS_RING}`}
            >
              {menu.footer.label}
              <span aria-hidden>→</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
