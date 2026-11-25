import Link from "next/link";
import { ago } from "@/lib/activity/status";
import type { UserDetail } from "@/lib/admin/user-detail";
import { Badge, Panel } from "../ui";

const days = (d: number | null) => (d == null ? "—" : `${d}d`);
const tone = (d: number | null) => (d != null && d <= 7 ? "text-danger" : d != null && d <= 30 ? "text-amber-600 dark:text-amber-400" : "text-muted");

export function SitesPanel({ sites, now }: { sites: UserDetail["sites"]; now: number }) {
  return (
    <Panel title={`Sites (${sites.length})`} action={<Link href={`/admin/sites`} className="text-xs text-accent hover:underline">All sites</Link>}>
      {sites.length === 0 ? <p className="px-4 py-6 text-sm text-muted">No sites added yet.</p> : (
        <ul className="divide-y divide-rule">
          {sites.map((s) => (
            <li key={s.id}>
              <Link href={`/admin/sites?s=${s.id}`} className="block px-4 py-2.5 hover:bg-accent-soft">
                <span className="flex items-center gap-2">
                  <span className="min-w-0 flex-1 truncate text-sm text-ink">{s.name} <span className="text-xs text-muted">{s.url.replace(/^https?:\/\//, "")}</span></span>
                  {s.locked ? <Badge>locked</Badge> : <Badge tone={s.status === "up" ? "ok" : s.status === "down" || s.status === "error" ? "danger" : "muted"}>{s.status}</Badge>}
                </span>
                <span className="mt-0.5 flex flex-wrap gap-x-3 text-xs tabular-nums text-muted">
                  <span className={tone(s.sslDaysLeft)}>SSL {days(s.sslDaysLeft)}</span>
                  <span className={tone(s.domainDaysLeft)}>Domain {days(s.domainDaysLeft)}</span>
                  {s.lastLatencyMs != null && <span>{s.lastLatencyMs} ms</span>}
                  <span>{s.lastCheckedAt ? `checked ${ago(s.lastCheckedAt, now)}` : "not checked yet"}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}
