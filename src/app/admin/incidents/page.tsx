import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/guard";
import { FAILING } from "@/lib/admin/filters";
import { ago, clock } from "@/lib/activity/status";
import { AdminHeader, Badge, Filters, Panel, Stat, Table, fmtDate, td } from "@/components/admin/ui";

export const metadata = { title: "Incidents" };
const RANGE = { "1d": 1, "7d": 7, "30d": 30 } as const;
type R = keyof typeof RANGE;

/** Platform-wide outages: sites down now, plus down/recovered and missed/resumed events. */
export default async function AdminIncidents(props: { searchParams: Promise<{ range?: string }> }) {
  await requireAdmin();
  const sp = await props.searchParams;
  const range: R = sp.range && sp.range in RANGE ? (sp.range as R) : "7d";
  const now = clock();
  const since = new Date(now - RANGE[range] * 86_400_000);
  const [downNow, alerts, beats, downCount, recCount] = await Promise.all([
    prisma.site.findMany({ where: { locked: false, status: { in: FAILING } }, orderBy: { alertDownAt: { sort: "asc", nulls: "last" } }, take: 50, select: { id: true, name: true, url: true, alertDownAt: true, lastCheckedAt: true, lastStatusCode: true, user: { select: { id: true, email: true } } } }),
    prisma.alertLog.findMany({ where: { kind: { in: ["down", "recovered"] }, createdAt: { gte: since } }, orderBy: { createdAt: "desc" }, take: 100, select: { id: true, kind: true, sent: true, createdAt: true, site: { select: { id: true, name: true } }, user: { select: { id: true, email: true } } } }),
    prisma.heartbeatEvent.findMany({ where: { at: { gte: since } }, orderBy: { at: "desc" }, take: 100, select: { id: true, kind: true, at: true, sent: true, heartbeat: { select: { name: true, user: { select: { id: true, email: true } } } } } }),
    prisma.alertLog.count({ where: { kind: "down", createdAt: { gte: since } } }),
    prisma.alertLog.count({ where: { kind: "recovered", createdAt: { gte: since } } }),
  ]);
  const rows = [
    ...alerts.map((a) => ({ id: a.id, at: a.createdAt, what: a.site.name, kind: a.kind === "down" ? "Site down" : "Site recovered", bad: a.kind === "down", user: a.user, sent: a.sent, siteId: a.site.id })),
    ...beats.map((b) => ({ id: b.id, at: b.at, what: b.heartbeat.name, kind: b.kind === "down" ? "Cron job missed" : "Cron job resumed", bad: b.kind === "down", user: b.heartbeat.user, sent: b.sent, siteId: null as string | null })),
  ].sort((a, b) => b.at.getTime() - a.at.getTime()).slice(0, 150);
  return (
    <div className="space-y-6">
      <AdminHeader title="Incidents" sub="Outages across every account. Times in IST.">
        <Filters path="/admin/incidents" q={{ range: sp.range }} name="range" options={[["1d", "24 hours"], ["7d", "7 days"], ["30d", "30 days"]]} />
      </AdminHeader>
      <div className="grid grid-cols-2 gap-px border border-rule bg-rule md:grid-cols-4">
        <Stat href="/admin/sites?status=down" label="Down right now" value={<span className={downNow.length ? "text-danger" : ""}>{downNow.length}</span>} note="Monitored sites failing" />
        <Stat label="Down alerts" value={downCount} note={`Last ${range}`} />
        <Stat label="Recoveries" value={recCount} note={`Last ${range}`} />
        <Stat label="Cron job events" value={beats.length} note={`Last ${range}`} />
      </div>
      <Panel title="Down right now">
        {downNow.length === 0 ? <p className="px-4 py-6 text-sm text-muted">Every monitored site is responding.</p> : (
          <ul className="divide-y divide-rule">
            {downNow.map((s) => (
              <li key={s.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-2.5 text-sm">
                <span className="h-2 w-2 shrink-0 rounded-full bg-danger" aria-hidden />
                <Link href={`/admin/sites?s=${s.id}`} className="min-w-0 flex-1 truncate text-ink hover:text-accent">{s.name} <span className="text-muted">{s.url.replace(/^https?:\/\//, "")}</span></Link>
                <Link href={`/admin/users/${s.user.id}`} className="max-w-[14rem] truncate text-xs text-muted hover:text-accent">{s.user.email}</Link>
                <span className="text-xs tabular-nums text-danger">{s.alertDownAt ? `down ${ago(s.alertDownAt, now).replace(" ago", "")}` : s.lastStatusCode ? `HTTP ${s.lastStatusCode}` : "failing"}</span>
              </li>
            ))}
          </ul>
        )}
      </Panel>
      <Panel title="Event feed">
        <Table head={["When", "Event", "Monitor", "Account", "Email"]} empty={rows.length === 0} emptyText="No incidents in this range.">
          {rows.map((r) => (
            <tr key={r.id}>
              <td className={`${td} text-muted`}>{fmtDate(r.at)}</td>
              <td className={td}><Badge tone={r.bad ? "danger" : "ok"}>{r.kind}</Badge></td>
              <td className={`${td} max-w-[240px] truncate`}>{r.siteId ? <Link href={`/admin/sites?s=${r.siteId}`} className="hover:text-accent">{r.what}</Link> : r.what}</td>
              <td className={`${td} max-w-[240px] truncate text-muted`}><Link href={`/admin/users/${r.user.id}`} className="hover:text-accent">{r.user.email}</Link></td>
              <td className={`${td} text-muted`}>{r.sent ? "sent" : "not sent"}</td>
            </tr>
          ))}
        </Table>
      </Panel>
    </div>
  );
}
