import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { expiryEvents, groupByMonth } from "@/lib/expiry/events";
import { calendarUrl } from "@/lib/expiry/ics";
import { CopyLine } from "@/components/heartbeats/parts";
import { EmptyState, PageHeader, Panel } from "@/components/dash/ui";
import { ExpiryAgenda } from "@/components/dash/expiry/ExpiryAgenda";
import { DashboardAddSiteButton } from "@/components/DashboardAddSiteButton";

export const dynamic = "force-dynamic";

export default async function ExpiryPage() {
  const session = await getSession();
  if (!session?.user?.id) redirect("/login");
  const sites = await prisma.site.findMany({
    where: { userId: session.user.id, locked: false },
    select: { id: true, name: true, url: true, sslExpiresAt: true, domainExpiresAt: true },
  });
  const events = expiryEvents(sites);
  const groups = groupByMonth(events);
  const later = events.filter((e) => e.date.slice(0, 7) > groups[groups.length - 1].key).length;
  return (
    <div className="space-y-6">
      <PageHeader title="Expiry calendar" description="Every SSL certificate and domain renewal date across your sites, for the next 12 months." />
      {events.length === 0 ? (
        <EmptyState
          icon="calendar"
          title={sites.length ? "Dates appear after the first checks" : "No sites yet"}
          text={sites.length ? "We read certificate and domain dates on each site's first check and once a day after that." : "Add a site and its SSL and domain expiry dates land here."}
          action={sites.length ? undefined : <DashboardAddSiteButton atLimit={false} label="Add a site" variant="accent" />}
        />
      ) : (
        <>
          <ExpiryAgenda groups={groups} />
          {later > 0 && <p className="text-sm text-muted">{later} more date{later === 1 ? "" : "s"} after the next 12 months.</p>}
        </>
      )}
      <Panel title="Add to your calendar">
        <div className="space-y-2 p-4">
          <p className="text-sm text-muted">Subscribe in Google Calendar (Other calendars → From URL), Apple Calendar or Outlook. Each date gets a reminder 7 days before. Keep this link private.</p>
          <CopyLine text={calendarUrl(session.user.id)} label="calendar feed link" />
        </div>
      </Panel>
    </div>
  );
}
