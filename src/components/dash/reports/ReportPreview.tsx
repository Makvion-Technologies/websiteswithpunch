import Link from "next/link";
import type { WeeklyReport } from "@/lib/reports/build";
import { Panel } from "@/components/dash/ui";
import { dayTone, inDays, shortDuration } from "@/components/dash/overview/format";

const pct = (v: number | null) => (v == null ? "–" : `${v}%`);

/** This week's numbers, laid out like the email. */
export function ReportPreview({ r }: { r: WeeklyReport }) {
  return (
    <Panel title={`This week · ${r.from} to ${r.to} (UTC)`}>
      <div className="grid grid-cols-3 gap-px border-b border-rule bg-rule">
        {[["Uptime", pct(r.uptime)], ["Incidents", String(r.incidents)], ["Expiring ≤30d", String(r.expiries.length)]].map(([k, v]) => (
          <div key={k} className="bg-surface px-4 py-3">
            <p className="label-caps text-muted">{k}</p>
            <p className="mt-1 font-display text-xl font-medium text-ink">{v}</p>
          </div>
        ))}
      </div>
      {r.sites.length === 0 ? (
        <p className="px-4 py-4 text-sm text-muted">Add a site to see it here.</p>
      ) : (
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
              {r.sites.slice(0, 25).map((s) => (
                <tr key={s.id} className="border-b border-rule last:border-b-0">
                  <td className="max-w-[200px] truncate px-4 py-2">
                    <Link href={`/dashboard/sites/${s.id}`} className="text-ink hover:text-accent">{s.name}</Link>
                  </td>
                  <td className="px-4 py-2 text-right text-ink">{pct(s.uptime)}</td>
                  <td className="px-4 py-2 text-right text-ink">{s.incidents}</td>
                  <td className="px-4 py-2 text-right text-muted">{s.downMs ? shortDuration(s.downMs) : "–"}</td>
                  <td className="px-4 py-2 text-right text-muted">{s.avgMs == null ? "–" : `${s.avgMs} ms`}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {r.expiries.length > 0 && (
        <div className="border-t border-rule px-4 py-3">
          <p className="text-xs font-medium text-muted">Coming up in the next 30 days</p>
          <ul className="mt-1.5 space-y-1 text-sm">
            {r.expiries.map((e) => (
              <li key={`${e.siteName}-${e.kind}`} className="flex justify-between gap-3">
                <span className="truncate text-ink">{e.kind} · {e.siteName}</span>
                <span className={`shrink-0 text-xs font-medium ${dayTone(e.daysLeft)}`}>{inDays(e.daysLeft)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {r.cronMissed > 0 && <p className="border-t border-rule px-4 py-3 text-sm text-ink">Cron jobs missed a ping {r.cronMissed} time{r.cronMissed === 1 ? "" : "s"}.</p>}
    </Panel>
  );
}
