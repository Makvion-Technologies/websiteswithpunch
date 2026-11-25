import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/guard";
import { JOBS, jobState, type JobKey } from "@/lib/admin/jobs";
import { platformKpis } from "@/lib/admin/insights";
import { FAST_CHECKS } from "@/lib/monitor/config";
import { HEARTBEATS } from "@/lib/heartbeats/config";
import { ago, clock } from "@/lib/activity/status";
import { Meter } from "@/components/admin/charts";
import { AdminHeader, Badge, Panel, Table, fmtDate, td } from "@/components/admin/ui";

export const metadata = { title: "System health" };

/** Scheduled jobs, Worker sync, free-tier budgets and which integrations are configured (yes/no only). */
export default async function AdminSystem() {
  await requireAdmin();
  const now = clock();
  const [runs, k, rows] = await Promise.all([
    prisma.jobRun.findMany(),
    platformKpis(now),
    Promise.all([prisma.user.count(), prisma.site.count(), prisma.checkResult.count(), prisma.alertLog.count(), prisma.userActivity.count(), prisma.rateLimit.count()]),
  ]);
  const byKey = new Map(runs.map((r) => [r.key, r]));
  const env = (v?: string) => Boolean(v && v.length > 0);
  const flags: Array<[string, boolean, string]> = [
    ["Fast checks (Worker)", FAST_CHECKS, "NEXT_PUBLIC_FAST_CHECKS"],
    ["Cron job monitoring", HEARTBEATS, "NEXT_PUBLIC_HEARTBEATS"],
    ["Email (Resend)", env(process.env.RESEND_API_KEY), "RESEND_API_KEY"],
    ["Payments (Dodo)", env(process.env.DODO_PAYMENTS_API_KEY), `DODO_PAYMENTS_ENVIRONMENT=${process.env.DODO_PAYMENTS_ENVIRONMENT || "unset"}`],
    ["Cron secret", env(process.env.CRON_SECRET), "CRON_SECRET"],
    ["Worker secret", env(process.env.MONITOR_SECRET), "MONITOR_SECRET"],
  ];
  const names = ["Users", "Sites", "Check results", "Alert log", "Activity rows", "Rate-limit rows"];
  return (
    <div className="space-y-6">
      <AdminHeader title="System health" sub="Everything runs on free tiers: Vercel Hobby, Neon, Cloudflare Workers and Resend." />
      <div className="grid gap-px border border-rule bg-rule md:grid-cols-2">
        <Meter label="Worker check capacity" used={k.capacity.perMin} limit={k.capacity.limit} unit="checks/min" note="Above 80%: stop adding large accounts or move Free sites to slower checks." />
        <Meter label="Emails, last 24 hours (estimate)" used={k.emails.total} limit={k.emails.limit} unit="sent" note="Resend free plan allows 100 a day. Weekly reports are spread across the week." />
      </div>
      <Panel title="Scheduled jobs & Worker sync">
        <Table head={["Job", "Schedule", "Last run", "State", "Note"]}>
          {(Object.keys(JOBS) as JobKey[]).map((key) => {
            const r = byKey.get(key);
            const st = jobState(r?.at, JOBS[key].staleMin, now);
            return (
              <tr key={key}>
                <td className={td}>{JOBS[key].label}</td>
                <td className={`${td} text-muted`}>{JOBS[key].every}</td>
                <td className={`${td} text-muted`}>{r ? <span title={fmtDate(r.at)}>{ago(r.at, now)}</span> : "—"}</td>
                <td className={td}>{st === "ok" && r?.ok !== false ? <Badge tone="ok">healthy</Badge> : st === "never" ? <Badge>no run yet</Badge> : <Badge tone="danger">{st === "late" ? "late" : "failed"}</Badge>}</td>
                <td className={`${td} max-w-[260px] truncate text-muted`}>{r?.note ?? "—"}{r?.ms ? ` · ${(r.ms / 1000).toFixed(1)}s` : ""}</td>
              </tr>
            );
          })}
        </Table>
      </Panel>
      <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-2">
        <Panel title="Configuration">
          <ul className="divide-y divide-rule">
            {flags.map(([label, on, hint]) => (
              <li key={label} className="flex items-center gap-3 px-4 py-2.5 text-sm">
                <span className="min-w-0 flex-1 text-ink">{label} <span className="block truncate font-mono text-[11px] text-muted">{hint}</span></span>
                <Badge tone={on ? "ok" : "danger"}>{on ? "on" : "off"}</Badge>
              </li>
            ))}
          </ul>
        </Panel>
        <Panel title="Database rows">
          <ul className="grid grid-cols-2 gap-px bg-rule">
            {rows.map((v, i) => (
              <li key={names[i]} className="bg-surface px-4 py-3">
                <p className="text-xs text-muted">{names[i]}</p>
                <p className="font-display text-lg font-medium tabular-nums text-ink">{v.toLocaleString("en-US")}</p>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </div>
  );
}
