"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { NAV_MENUS, NAV_PRICING } from "./nav-data";
import { FOCUS_RING, NavDropdown } from "./NavDropdown";
import { MobileNav } from "./MobileNav";

type Via = "hover" | "click" | "key";
const OPEN_DELAY = 80;
const CLOSE_DELAY = 160;

/** Signed-out navbar: Product, Free tools and Resources dropdowns, Pricing, Log in, Start free. */
export function GuestNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState<{ id: string; via: Via } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  const clear = () => timer.current && clearTimeout(timer.current);

  useEffect(() => {
    setOpen(null);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: PointerEvent) => {
      if (!(e.target as Element | null)?.closest?.("[data-guest-nav]")) setOpen(null);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(null);
    document.addEventListener("pointerdown", onDoc);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDoc);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => clear, []);

  function hover(id: string, inside: boolean) {
    clear();
    if (inside) {
      timer.current = setTimeout(() => setOpen((o) => (o?.via === "click" && o.id === id ? o : { id, via: "hover" })), OPEN_DELAY);
    } else {
      timer.current = setTimeout(() => setOpen((o) => (o?.id === id && o.via === "hover" ? null : o)), CLOSE_DELAY);
    }
  }

  function click(id: string) {
    clear();
    // A click right after hover-open pins the panel instead of closing it.
    setOpen((o) => (o?.id === id ? (o.via === "hover" ? { id, via: "click" } : null) : { id, via: "click" }));
  }

  const link = `px-3 py-1.5 text-ink hover:bg-accent-soft ${FOCUS_RING}`;

  return (
    <>
      <div data-guest-nav className="hidden items-center gap-1 lg:flex">
        {NAV_MENUS.map((m) => (
          <NavDropdown
            key={m.id}
            menu={m}
            open={open?.id === m.id}
            focusFirst={open?.id === m.id && open.via === "key"}
            onTriggerClick={() => click(m.id)}
            onOpenKeyboard={() => setOpen({ id: m.id, via: "key" })}
            onClose={() => setOpen(null)}
            onHover={(inside) => hover(m.id, inside)}
          />
        ))}
        <Link href={NAV_PRICING.href} className={link}>
          {NAV_PRICING.label}
        </Link>
      </div>
      <div className="flex items-center gap-2">
        <Link href="/login" className={`hidden lg:inline-flex ${link}`}>
          Log in
        </Link>
        <Link
          href="/signup"
          className={`hidden bg-accent px-3 py-1.5 font-medium text-white hover:bg-accent-hover sm:inline-flex ${FOCUS_RING}`}
        >
          Start free
        </Link>
        <ThemeToggle />
        <div className="lg:hidden">
          <MobileNav />
        </div>
      </div>
    </>
  );
}
