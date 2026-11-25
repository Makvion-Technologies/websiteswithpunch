import Link from "next/link";
import type { OverviewExpiry, OverviewIncident } from "@/lib/overview";
import { LocalTime } from "@/components/dash/LocalTime";
import { Panel, TextLink } from "@/components/dash/ui";
import { dayTone, inDays, shortDuration } from "./format";

type Down = { id: string; name: string; url: string; status: string; lastStatusCode: number | null };

export function NeedsAttention({ down, total }: { down: Down[]; total: number }) {
  return (
    <Panel title="Needs attention">
      {down.length === 0 ? (
        <p className="flex items-center gap-2 px-4 py-4 text-sm text-ink">
          <span className="h-2 w-2 bg-emerald-500" aria-hidden />
          All {total} monitor{total === 1 ? " is" : "s are"} up.
        </p>
      ) : (
        <ul>
          {down.map((s) => (
            <li key={s.id} className="border-b border-rule last:border-b-0">
              <Link href={`/dashboard/sites/${s.id}`} className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-bg">
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-ink">{s.name}</span>
                  <span className="block truncate text-xs text-muted">{s.url}</span>
                </span>
                <span className="shrink-0 text-xs font-medium text-rose-700 dark:text-rose-300">
                  {s.status === "error" ? "Error" : "Down"}
                  {s.lastStatusCode ? ` · ${s.lastStatusCode}` : ""}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}

export function RecentIncidents({ incidents }: { incidents: OverviewIncident[] }) {
  return (
    <Panel title="Incidents, last 7 days">
      {incidents.length === 0 ? (
        <p className="px-4 py-4 text-sm text-muted">No incidents this week.</p>
      ) : (
        <ul>
          {incidents.slice(0, 6).map((i) => (
            <li key={`${i.siteId}-${i.startedAt}`} className="flex items-start justify-between gap-3 border-b border-rule px-4 py-3 last:border-b-0">
              <div className="min-w-0">
                <Link href={`/dashboard/sites/${i.siteId}`} className="block truncate text-sm font-medium text-ink hover:text-accent">
                  {i.siteName}
                </Link>
                <p className="truncate text-xs text-muted">
                  <LocalTime iso={i.startedAt} />
                  {i.reason ? ` · ${i.reason}` : ""}
                </p>
              </div>
              <span className={`shrink-0 text-xs font-medium ${i.ongoing ? "text-rose-700 dark:text-rose-300" : "text-muted"}`}>
                {i.ongoing ? "Ongoing" : shortDuration(i.durationMs)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}

export function UpcomingExpiries({ expiries }: { expiries: OverviewExpiry[] }) {
  return (
    <Panel title="Upcoming expiries" action={<TextLink href="/dashboard/expiry">Calendar →</TextLink>}>
      {expiries.length === 0 ? (
        <p className="px-4 py-4 text-sm text-muted">Dates appear after the first SSL and domain checks.</p>
      ) : (
        <ul>
          {expiries.slice(0, 5).map((e) => (
            <li key={`${e.siteId}-${e.kind}`} className="flex items-center justify-between gap-3 border-b border-rule px-4 py-2.5 last:border-b-0">
              <span className="min-w-0 truncate text-sm text-ink">
                <span className="mr-1.5 border border-rule px-1 py-px text-[10px] font-medium uppercase tracking-wide text-muted">{e.kind}</span>
                {e.siteName}
              </span>
              <span className={`shrink-0 text-xs font-medium ${dayTone(e.daysLeft)}`}>{inDays(e.daysLeft)}</span>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}

export function AlertRoutes({ channels }: { channels: Array<{ kind: string; name: string }> }) {
  return (
    <Panel title="Alerts go to" action={<TextLink href="/dashboard/alerts">Manage →</TextLink>}>
      <ul className="px-4 py-3 text-sm text-ink">
        <li className="py-1">Email (your account address)</li>
        {channels.slice(0, 4).map((c, i) => (
          <li key={i} className="truncate py-1">
            <span className="capitalize text-muted">{c.kind}</span> · {c.name}
          </li>
        ))}
        {channels.length > 4 && <li className="py-1 text-muted">+{channels.length - 4} more</li>}
      </ul>
    </Panel>
  );
}
