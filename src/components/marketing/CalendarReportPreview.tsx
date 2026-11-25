import { badgeSvg, BADGE_COLORS, uptimeColor } from "@/lib/badges/svg";
import { urgency, type MonthGroup } from "@/lib/expiry/events";
import { inDays, shortDuration } from "@/components/dash/overview/format";
import { Panel } from "@/components/dash/ui";
import { shareExpiryGroups, shareReport } from "./share-data";

const BAR = { overdue: "bg-rose-500", soon: "bg-rose-500", month: "bg-amber-500", later: "bg-accent" } as const;
const RANK = ["overdue", "soon", "month", "later"] as const;
const TEXT = { overdue: "text-rose-700 dark:text-rose-300", soon: "text-rose-700 dark:text-rose-300", month: "text-amber-700 dark:text-amber-300", later: "text-muted" } as const;

function MonthStrip({ groups }: { groups: MonthGroup[] }) {
  const max = Math.max(1, ...groups.map((g) => g.events.length));
  return (
    <div className="grid grid-cols-6 gap-px border border-rule bg-rule sm:grid-cols-12">
      {groups.map((g) => {
        const n = g.events.length;
        const worst = RANK[Math.min(3, ...g.events.map((e) => RANK.indexOf(urgency(e.daysLeft))))];
        return (
          <div key={g.key} className={`flex flex-col bg-surface px-2 py-2 ${n ? "" : "opacity-60"}`}>
            <span className="text-[11px] text-muted">{g.label.split(" ")[0]}</span>
            <span className="mt-1 flex h-8 items-end">
              <span className={`w-full ${n ? BAR[worst] : "bg-ink/10"}`} style={{ height: `${n ? 20 + (n / max) * 80 : 8}%` }} />
            </span>
            <span className="mt-1 text-xs font-medium text-ink">{n || "–"}</span>
          </div>
        );
      })}
    </div>
  );
}

/** Inert expiry agenda, weekly report card and uptime badges, matching the dashboard screens. */
export function CalendarReportPreview() {
  const r = shareReport;
  const upcoming = shareExpiryGroups.filter((g) => g.events.length).slice(0, 2);
  const pct = (v: number | null) => (v == null ? "–" : `${v}%`);
  return (
    <div className="space-y-5">
      <Panel title="Expiry calendar">
        <div className="space-y-4 p-3 sm:p-4">
          <MonthStrip groups={shareExpiryGroups} />
          {upcoming.map((g) => (
            <div key={g.key}>
              <p className="label-caps text-muted">{g.label}</p>
              <ul className="mt-2 border border-rule bg-surface">
                {g.events.map((e) => {
                  const u = urgency(e.daysLeft);
                  return (
                    <li key={`${e.siteId}-${e.kind}`} className="flex items-center gap-3 border-b border-rule px-4 py-3 last:border-b-0">
                      <span className="w-12 shrink-0 text-center">
                        <span className="block font-display text-lg font-medium leading-5 text-ink">{e.date.slice(8, 10)}</span>
                        <span className="block text-[10px] uppercase tracking-wide text-muted">{e.kind === "ssl" ? "SSL" : "Domain"}</span>
                      </span>
                      <span className={`h-8 w-0.5 shrink-0 ${BAR[u]}`} />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-ink">{e.siteName}</span>
                        <span className="block truncate text-xs text-muted">{e.host}</span>
                      </span>
                      <span className={`shrink-0 text-xs font-medium ${TEXT[u]}`}>{inDays(e.daysLeft)}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </Panel>

      <Panel title={`This week · ${r.from} to ${r.to} (UTC)`}>
        <div className="grid grid-cols-3 gap-px border-b border-rule bg-rule">
          {[["Uptime", pct(r.uptime)], ["Incidents", String(r.incidents)], ["Expiring ≤30d", String(r.expiries.length)]].map(([k, v]) => (
            <div key={k} className="bg-surface px-3 py-3 sm:px-4">
              <p className="label-caps text-muted">{k}</p>
              <p className="mt-1 font-display text-xl font-medium text-ink">{v}</p>
            </div>
          ))}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[420px] text-sm">
            <thead>
              <tr className="border-b border-rule text-left text-xs text-muted">
                <th className="px-4 py-2 font-medium">Site</th>
                <th className="px-4 py-2 text-right font-medium">Uptime</th>
                <th className="px-4 py-2 text-right font-medium">Incidents</th>
                <th className="px-4 py-2 text-right font-medium">Downtime</th>
                <th className="px-4 py-2 text-right font-medium">Avg response</th>
              </tr>
            </thead>
            <tbody>
              {r.sites.map((s) => (
                <tr key={s.id} className="border-b border-rule last:border-b-0">
                  <td className="max-w-[200px] truncate px-4 py-2 text-ink">{s.name}</td>
                  <td className="px-4 py-2 text-right text-ink">{pct(s.uptime)}</td>
                  <td className="px-4 py-2 text-right text-ink">{s.incidents}</td>
                  <td className="px-4 py-2 text-right text-ink">{shortDuration(s.downMs)}</td>
                  <td className="px-4 py-2 text-right text-ink">{s.avgMs == null ? "–" : `${s.avgMs} ms`}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <div className="flex flex-wrap items-center gap-3 border border-dashed border-rule bg-surface px-4 py-3">
        <span className="text-xs font-medium text-muted">Badges</span>
        <span dangerouslySetInnerHTML={{ __html: badgeSvg("uptime", "99.9%", uptimeColor(99.9)) }} />
        <span dangerouslySetInnerHTML={{ __html: badgeSvg("status", "up", BADGE_COLORS.up) }} />
        <span dangerouslySetInnerHTML={{ __html: badgeSvg("status", "down", BADGE_COLORS.down) }} />
      </div>
    </div>
  );
}
