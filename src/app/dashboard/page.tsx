import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getEffectivePlan, getUserEffectiveSiteLimit, resolvePackCountForLimit } from "@/lib/plans";
import { loadAccount } from "@/lib/account-load";
import { loadOverview } from "@/lib/overview";
import { HEARTBEATS } from "@/lib/heartbeats/config";
import { DashboardAddSiteButton } from "@/components/DashboardAddSiteButton";
import { DashboardBanners } from "@/components/DashboardBanners";
import { DashboardPendingBanner } from "@/components/DashboardPendingBanner";
import { SessionPlanSync } from "@/components/SessionPlanSync";
import { CheckoutReturn } from "@/components/billing/CheckoutReturn";
import { EmptyState, PageHeader } from "@/components/dash/ui";
import { Checklist } from "@/components/dash/overview/Checklist";
import { Tiles } from "@/components/dash/overview/Tiles";
import { AlertRoutes, NeedsAttention, RecentIncidents, UpcomingExpiries } from "@/components/dash/overview/Lists";

export const dynamic = "force-dynamic";

type Search = { checkout?: string; subscription_id?: string; status?: string };

export default async function OverviewPage(props: { searchParams: Promise<Search> }) {
  const searchParams = await props.searchParams;
  const session = await getSession();
  if (!session?.user?.id) redirect("/login");
  const { user, sites } = await loadAccount(session.user.id);
  if (!user) redirect("/login");

  const plan = getEffectivePlan(user.plan, user.dodoStatus);
  const packCount = resolvePackCountForLimit(user).packCount;
  const limit = getUserEffectiveSiteLimit(plan, user.sitePackCount, user.pendingSitePackCount, user.pendingPackChangeAt);
  const active = sites.filter((s) => !s.locked);
  const atLimit = active.length >= limit;
  const o = await loadOverview(user.id, active, user.weeklyReport, HEARTBEATS);
  const down = active.filter((s) => s.status === "down" || s.status === "error");
  const up = active.filter((s) => s.status === "up").length;
  const week = o.incidents.length;
  const next = o.expiries[0];
  const showChecklist = !user.onboardingDismissedAt;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Overview"
        description={`Welcome back${user.name ? `, ${user.name.split(" ")[0]}` : ""}. Here's what needs you today.`}
        actions={<DashboardAddSiteButton atLimit={atLimit} pickUpPending />}
      />
      {searchParams.checkout && (
        <CheckoutReturn outcome={searchParams.checkout} subscriptionId={searchParams.subscription_id} status={searchParams.status} plan={plan} />
      )}
      <DashboardBanners
        showDefaultLockNotice={user.showDefaultLockNotice}
        paymentFailed={user.dodoStatus === "past_due" || user.dodoStatus === "on_hold"}
        onHold={user.dodoStatus === "on_hold"}
        siteLimit={limit}
        activeCount={active.length}
      />
      <DashboardPendingBanner plan={plan} sitePackCount={packCount} />
      <SessionPlanSync plan={plan} />

      {showChecklist && <Checklist setup={o.setup} cron={HEARTBEATS} atLimit={atLimit} />}

      {active.length === 0 ? (
        !showChecklist && (
          <EmptyState
            icon="monitors"
            title="Nothing to watch yet"
            text="Add your first site and this page fills with live status, incidents and upcoming expiry dates."
            action={<DashboardAddSiteButton atLimit={atLimit} label="Add your first site" variant="accent" />}
          />
        )
      ) : (
        <>
          <Tiles
            tiles={[
              { label: "Monitors up", value: `${up}/${active.length}`, sub: down.length ? `${down.length} need attention` : "All responding", href: "/dashboard/monitors", tone: down.length ? "bad" : "good" },
              { label: "Incidents", value: String(week), sub: "Last 7 days", href: "/dashboard/monitors", tone: week ? "warn" : undefined },
              { label: "Uptime", value: o.uptime30 == null ? "–" : `${o.uptime30}%`, sub: "Last 30 days, all sites", href: "/dashboard/reports" },
              { label: "Next expiry", value: next ? `${Math.max(0, next.daysLeft)}d` : "–", sub: next ? `${next.kind} · ${next.siteName}` : "No dates yet", href: "/dashboard/expiry", tone: next && next.daysLeft <= 7 ? "bad" : next && next.daysLeft <= 30 ? "warn" : undefined },
            ]}
          />
          <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
            <div className="space-y-6">
              <NeedsAttention down={down} total={active.length} />
              <RecentIncidents incidents={o.incidents} />
            </div>
            <div className="space-y-6">
              <UpcomingExpiries expiries={o.expiries} />
              <AlertRoutes channels={o.channels} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
