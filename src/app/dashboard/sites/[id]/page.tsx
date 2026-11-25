import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SiteAnalytics } from "@/components/SiteAnalytics";
import { SiteCard } from "@/components/SiteCard";
import { SiteRecheckProvider } from "@/components/SiteRecheckProvider";
import { toClientSite } from "@/lib/client-site";
import { badgeUrls } from "@/lib/badges/sign";
import { SiteTabs, parseTab } from "@/components/dash/site/SiteTabs";
import { BadgePanel } from "@/components/dash/site/BadgePanel";
import { SiteAlertsPanel } from "@/components/dash/site/SiteAlertsPanel";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ tab?: string }> };

export default async function SitePage(props: Props) {
  const [params, search] = await Promise.all([props.params, props.searchParams]);
  const tab = parseTab(search.tab);
  const session = await getSession();
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id;

  // Site + its freshest check in one parallel round trip; both scoped to the owner.
  const [site, latest] = await Promise.all([
    prisma.site.findFirst({ where: { id: params.id, userId } }),
    prisma.checkResult.findFirst({
      where: { siteId: params.id, site: { userId } },
      orderBy: [{ checkedAt: "desc" }, { id: "desc" }],
      select: { checkedAt: true },
    }),
  ]);
  if (!site) notFound();

  return (
    <div>
      <div className="mb-4">
        <Link href="/dashboard/monitors" className="text-sm text-muted hover:text-accent">
          ← Monitors
        </Link>
      </div>
      <SiteRecheckProvider siteId={site.id} lastCheckedAt={site.lastCheckedAt?.toISOString() ?? null}>
        <div className="space-y-5">
          <SiteCard
            showAnalyticsLink={false}
            site={{ ...toClientSite(site), lastCheckedAt: site.lastCheckedAt?.toISOString() ?? null, lastSeenAt: latest?.checkedAt.toISOString() ?? null }}
          />
          {!site.locked && <SiteTabs siteId={site.id} active={tab} />}
          {(site.locked || tab === "analytics") && <SiteAnalytics siteId={site.id} />}
          {!site.locked && tab === "alerts" && <AlertsTab userId={userId} siteId={site.id} />}
          {!site.locked && tab === "badge" && <BadgePanel urls={badgeUrls(site.id)} siteUrl={site.url} />}
        </div>
      </SiteRecheckProvider>
    </div>
  );
}

async function AlertsTab({ userId, siteId }: { userId: string; siteId: string }) {
  const [user, channels] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { email: true, alertDown: true, alertSsl: true, alertDomain: true } }),
    prisma.alertChannel.findMany({ where: { userId }, select: { id: true, kind: true, name: true, enabled: true, allSites: true, siteIds: true }, orderBy: { createdAt: "asc" } }),
  ]);
  if (!user) return null;
  const mine = channels.filter((c) => c.allSites || c.siteIds.includes(siteId));
  return <SiteAlertsPanel email={user.email} prefs={user} channels={mine} other={channels.length - mine.length} />;
}
