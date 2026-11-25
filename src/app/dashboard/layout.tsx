import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { cookies, headers } from "next/headers";
import { after } from "next/server";
import { recordSessionStart, SESSION_COOKIE } from "@/lib/activity/record";
import { NO_INDEX } from "@/lib/site-config";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getEffectivePlan, getUserEffectiveSiteLimit, PLANS } from "@/lib/plans";
import { HEARTBEATS } from "@/lib/heartbeats/config";
import { dashNav } from "@/components/dash/nav-items";
import { DashSidebar } from "@/components/dash/DashSidebar";
import { DashMobileNav } from "@/components/dash/DashMobileNav";

export const metadata: Metadata = { robots: NO_INDEX };

/**
 * Dashboard shell: left rail on desktop, bottom tab bar on phones. It stays mounted while pages
 * change, so navigation only swaps the content area (each page has a matching skeleton).
 */
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session?.user) redirect("/login");
  if (session.user.verified === false) redirect("/verify-email");
  const [user, used] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { plan: true, dodoStatus: true, sitePackCount: true, pendingSitePackCount: true, pendingPackChangeAt: true },
    }),
    prisma.site.count({ where: { userId: session.user.id, locked: false } }),
  ]);
  if (!user) redirect("/login");
  // New browser session (the proxy sets the session cookie on this response): record "last
  // active" once, after the page is sent. Later dashboard requests in the session write nothing.
  if (!(await cookies()).has(SESSION_COOKIE)) {
    const h = new Headers(await headers());
    const id = session.user.id;
    after(() => recordSessionStart(id, h, "session").catch((e) => console.warn("[activity] session record failed", e)));
  }
  const plan = getEffectivePlan(user.plan, user.dodoStatus);
  const limit = getUserEffectiveSiteLimit(plan, user.sitePackCount, user.pendingSitePackCount, user.pendingPackChangeAt);
  const groups = dashNav(HEARTBEATS);
  return (
    <div data-app-shell className="app-shell mx-auto w-full px-4 sm:px-6 lg:grid lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-8 lg:px-8 2xl:gap-10 2xl:px-10">
      <DashSidebar groups={groups} plan={{ planName: PLANS[plan].name, used, limit, upgrade: plan !== "business" }} />
      <div className="min-w-0 py-6 lg:py-8">{children}</div>
      <DashMobileNav groups={groups} />
    </div>
  );
}
