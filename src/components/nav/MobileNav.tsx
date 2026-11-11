"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ModalPortal } from "@/components/ModalPortal";
import { FOCUS_RING } from "./NavDropdown";
import { MobileNavSheet } from "./MobileNavSheet";

/** Hamburger for phones and tablets: opens a full-screen menu with collapsible sections. */
export function MobileNav() {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const prev = root.style.overflow;
    root.style.overflow = "hidden";
    return () => {
      root.style.overflow = prev;
    };
  }, [open]);

  function close() {
    setOpen(false);
    buttonRef.current?.focus();
  }

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        aria-label="Open menu"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        title="Menu"
        className={`inline-flex h-8 w-8 shrink-0 items-center justify-center border border-rule text-ink hover:bg-accent-soft ${FOCUS_RING}`}
      >
        <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
      </button>
      {open && (
        <ModalPortal>
          <MobileNavSheet onClose={close} />
        </ModalPortal>
      )}
    </>
  );
}
