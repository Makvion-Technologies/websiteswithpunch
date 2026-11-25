import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import {
  getEffectivePlan,
  getUserEffectiveSiteLimit,
  PLANS,
  resolvePackCountForLimit,
} from "@/lib/plans";
import { SiteCard } from "@/components/SiteCard";
import { SiteAnalytics } from "@/components/SiteAnalytics";
import { SiteRecheckScope } from "@/components/SiteRecheckProvider";
import { DashboardPackCta } from "@/components/DashboardPackCta";
import { DashboardAddSiteButton } from "@/components/DashboardAddSiteButton";
import { DashboardBanners } from "@/components/DashboardBanners";
import { DashboardPendingBanner } from "@/components/DashboardPendingBanner";
import { SessionPlanSync } from "@/components/SessionPlanSync";
import { CheckoutReturn } from "@/components/billing/CheckoutReturn";
import { loadAccount } from "@/lib/account-load";
import { toDashboardSite } from "@/lib/dashboard-sites";
import { RememberLayout } from "@/components/skeleton/shape";
import { FAST_CHECKS, cadenceText } from "@/lib/monitor/config";
import { EmptyState, PageHeader } from "@/components/dash/ui";

export const dynamic = "force-dynamic";

export default async function MonitorsPage(
  props: {
    searchParams: Promise<{ checkout?: string; subscription_id?: string; status?: string }>;
  }
) {
  const searchParams = await props.searchParams;
  const session = await getSession();
  if (!session?.user?.id) redirect("/login");

  const { user, sites: sitesRaw } = await loadAccount(session.user.id);
  if (!user) redirect("/login");

  const plan = getEffectivePlan(user.plan, user.dodoStatus);
  const resolved = resolvePackCountForLimit({
    sitePackCount: user.sitePackCount,
    pendingSitePackCount: user.pendingSitePackCount,
    pendingPackChangeAt: user.pendingPackChangeAt,
  });

  const packCount = resolved.packCount;
  const limit = getUserEffectiveSiteLimit(
    plan,
    user.sitePackCount,
    user.pendingSitePackCount,
    user.pendingPackChangeAt,
  );

  const activeSites = sitesRaw.filter((s) => !s.locked);
  const lockedSites = sitesRaw.filter((s) => s.locked);
  const atLimit = activeSites.length >= limit;
  const remaining = Math.max(0, limit - activeSites.length);
  const canUnlock = remaining > 0;
  const showInlineAnalytics = activeSites.length === 1 && lockedSites.length === 0;
  const planLabel = PLANS[plan].name;

  const clientSites = sitesRaw.map(toDashboardSite);


  return (
    <div>
      <RememberLayout
        plan={plan}
        active={activeSites.length}
        locked={lockedSites.length}
        limit={limit}
        billing={Boolean(user.dodoCustomerId)}
        cards={sitesRaw
          .slice(0, 12)
          .map((s): [number, number, number] => [s.name.length, s.url.length, s.locked ? 1 : 0])}
      />
      <PageHeader
        title="Monitors"
        description={
          <>
            <span className="font-medium text-ink">{planLabel}</span> · {activeSites.length}/{limit} active
            {lockedSites.length > 0 ? ` · ${lockedSites.length} locked` : ""}
            {FAST_CHECKS ? ` · Uptime checked ${cadenceText(plan)}` : ""}. Each site gets uptime, SSL and domain checks.
          </>
        }
        actions={
          <>
            <DashboardAddSiteButton atLimit={atLimit} pickUpPending />
            <DashboardPackCta plan={plan} sitePackCount={packCount} />
          </>
        }
      />

      {searchParams.checkout && (
        <CheckoutReturn
          outcome={searchParams.checkout}
          subscriptionId={searchParams.subscription_id}
          status={searchParams.status}
          plan={plan}
        />
      )}

      <DashboardBanners
        showDefaultLockNotice={user.showDefaultLockNotice}
        paymentFailed={user.dodoStatus === "past_due" || user.dodoStatus === "on_hold"}
        onHold={user.dodoStatus === "on_hold"}
        siteLimit={limit}
        activeCount={activeSites.length}
      />

      <DashboardPendingBanner plan={plan} sitePackCount={packCount} />
      <SessionPlanSync plan={plan} />

      {sitesRaw.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            icon="monitors"
            title="No monitors yet"
            text="Add a URL and we check its uptime, SSL certificate and domain expiry, then alert you before visitors notice."
            action={<DashboardAddSiteButton atLimit={atLimit} label="Add your first site" variant="accent" />}
          />
        </div>
      ) : (
        // One site with inline analytics: its card shares the auto refresh timer.
        <SiteRecheckScope
          siteId={showInlineAnalytics ? activeSites[0].id : null}
          lastCheckedAt={
            showInlineAnalytics ? (activeSites[0].lastCheckedAt?.toISOString() ?? null) : null
          }
        >
          <div className="mt-8 space-y-5">
            {clientSites.map((site) => (
              <SiteCard
                key={site.id}
                showAnalyticsLink={!showInlineAnalytics && !site.locked}
                siteLimit={limit}
                canUnlock={site.locked && canUnlock}
                hasLockedSites={lockedSites.length > 0}
                site={site}
              />
            ))}
            {showInlineAnalytics && <SiteAnalytics siteId={activeSites[0].id} />}
            {!showInlineAnalytics && activeSites.length > 1 && (
              <p className="text-center text-sm text-muted">
                Open <span className="font-medium text-ink">Analytics →</span> on any active site for
                the full breakdown with range filters.
              </p>
            )}
          </div>
        </SiteRecheckScope>
      )}

    </div>
  );
}
