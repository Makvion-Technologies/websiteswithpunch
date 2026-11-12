"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { GuestNav } from "@/components/nav/GuestNav";
import { NavShell } from "@/components/nav/NavShell";
import { navHintValue, writeNavHint } from "@/components/nav/nav-hint";
import { NavUpgradeButtons } from "@/components/NavUpgradeButtons";
import { ProfileMenu } from "@/components/ProfileMenu";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AdminMenu } from "@/components/admin/AdminMenu";

/** Signed-in visitors are redirected away from these, so they always show the guest navbar. */
const GUEST_ONLY = ["/login", "/signup"];

export function Navbar() {
  const { data, status: rawStatus } = useSession();
  // While a sign-in is navigating away from /login or /signup, keep the guest navbar so it
  // switches together with the page instead of flipping over the still-visible form.
  const pathname = usePathname() ?? "";
  const guestOnly = GUEST_ONLY.includes(pathname);
  const session = guestOnly ? null : data;
  // Unverified accounts can only use /verify-email: no upgrade buttons or account menu anywhere.
  const unverified = session?.user?.verified === false;
  const verifying = pathname === "/verify-email" || unverified;
  const status = guestOnly ? "unauthenticated" : rawStatus;
  const admin = Boolean(session?.user?.admin) && !unverified;
  // Before the session resolves (SSR and first client render) the guest menu and the signed-in copy
  // are both in the HTML; the head script + CSS show the right one, so nothing is empty or flips.
  const pending = status === "loading" && pathname !== "/verify-email";
  const guest = pending || (status === "unauthenticated" && !verifying);

  useEffect(() => {
    if (rawStatus !== "loading") writeNavHint(navHintValue(data ?? null));
  }, [rawStatus, data]);

  return (
    <header className="sticky top-0 z-50 border-b border-rule bg-bg/90 backdrop-blur">
      <div className="relative mx-auto flex max-w-6xl min-w-0 items-center justify-between gap-2 px-4 py-4 sm:px-6">
        <Link
          href={unverified ? "/verify-email" : admin ? "/admin" : session ? "/dashboard" : "/"}
          className="flex min-w-0 items-center gap-2 font-display text-sm font-medium text-ink sm:gap-2.5 sm:text-base"
        >
          <Image
            src="/logo.svg"
            alt=""
            width={32}
            height={32}
            priority
            unoptimized
            className="h-7 w-7 shrink-0 object-contain md:h-8 md:w-8"
          />
          <span className="truncate">Websites With Punch</span>
        </Link>
        {guest ? (
          <nav aria-label="Main" className="flex min-w-0 flex-1 items-center justify-end gap-2 text-sm lg:justify-end">
            <div className={pending ? "nav-pending-guest" : "contents"}>
              <GuestNav />
            </div>
            {pending ? <NavShell /> : null}
          </nav>
        ) : (
        <nav className="flex shrink-0 items-center gap-2 text-sm">
          {verifying ? (
            <>
              {unverified && pathname !== "/verify-email" && (
                <Link href="/verify-email" className="px-3 py-1.5 font-medium text-accent hover:bg-accent-soft">
                  Verify email
                </Link>
              )}
              <ThemeToggle />
            </>
          ) : admin ? (
            <>
              <span className="border border-accent/30 px-2 py-0.5 text-[11px] font-medium uppercase tracking-wider text-accent">Admin</span>
              <ThemeToggle />
              <AdminMenu email={session?.user?.email ?? "admin"} />
            </>
          ) : session ? (
            <>
              <NavUpgradeButtons />
              <ThemeToggle />
              <ProfileMenu />
            </>
          ) : null}
        </nav>
        )}
      </div>
    </header>
  );
}
