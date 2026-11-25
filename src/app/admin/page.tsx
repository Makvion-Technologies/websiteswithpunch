import Link from "next/link";
import { requireAdmin } from "@/lib/admin/guard";
import { newCounts } from "@/lib/admin/seen";
import { overviewStats } from "@/lib/admin/overview";
import { platformKpis, signupSeries, topCountries, topSources } from "@/lib/admin/insights";
import { PLAN_BUCKETS, PLAN_BUCKET_FILTER, PLAN_BUCKET_LABEL } from "@/lib/admin/plan-mix";
import { countryName } from "@/lib/activity/geo";
import { fmtUsd } from "@/lib/referrals/config";
import { AdminHeader, Panel, Stat } from "@/components/admin/ui";
import { Attention } from "@/components/admin/Attention";
import { BarChart, Meter, ShareList } from "@/components/admin/charts";
import { RecentUsers } from "@/components/admin/RecentUsers";

export const metadata = { title: "Overview" };

const n = (v: number) => v.toLocaleString("en-US");
const RANGES = { "30": 30, "90": 90 } as const;

export default async function AdminOverview(props: { searchParams: Promise<{ days?: string }> }) {
  const sp = await props.searchParams;
  const admin = await requireAdmin();
  const days = RANGES[(sp.days ?? "30") as keyof typeof RANGES] ?? 30;
  const [fresh, s, k, series, countries, sources] = await Promise.all([
    newCounts(admin.email!, ["payouts:requested", "sites:down", "sites:ssl", "sites:domain", "messages:open"]),
    overviewStats(),
    platformKpis(),
    signupSeries(days),
    topCountries(),
    topSources(),
  ]);
  const paying = k.seg.paid + k.seg["at-risk"];
  return (
    <div className="space-y-6">
      <AdminHeader title="Overview" sub="Live numbers from the database. Active = signed in or opened the dashboard in a new session." />
      <Attention s={s} fresh={fresh} />

      <div className="grid grid-cols-2 gap-px border border-rule bg-rule md:grid-cols-3 xl:grid-cols-6">
        <Stat href="/admin/users" label="Total users" value={n(k.users)} note={`${n(s.verified)} verified`} />
        <Stat href="/admin/users?sort=joined" label="New users" value={n(k.new7)} note={`7 days · ${n(k.new30)} in 30 days`} />
        <Stat href="/admin/users?act=today" label="Active today (DAU)" value={n(k.dau)} note={`WAU ${n(k.wau)} · MAU ${n(k.mau)}`} />
        <Stat href="/admin/users?plan=paid" label="Paying" value={n(paying)} note={`${k.paidShare}% of users`} />
        <Stat label="MRR (estimated)" value={`$${n(k.mrr)}`} note="Plans + Custom blocks at monthly list price" />
        <Stat href="/admin/sites?status=monitored" label="Sites monitored" value={n(k.sites)} note={s.down ? <span className="text-danger">{n(s.down)} down now</span> : "None down"} />
      </div>
      <div className="grid grid-cols-2 gap-px border border-rule bg-rule md:grid-cols-4 2xl:grid-cols-8">
        <Stat href="/admin/users?act=dormant" label="Dormant 30d+" value={n(Math.max(0, k.users - k.mau))} note="No session in 30 days" />
        <Stat
          href="/admin/users?plan=trial"
          label="On trial"
          value={n(k.trials.running)}
          note={k.trials.conversionPct === null ? `${n(k.trials.converted)} converted so far` : `${n(k.trials.converted)} converted · ${k.trials.conversionPct}% of ended trials`}
        />
        <Stat label="Cancellations (30d)" value={n(k.cancelled30)} note={`${n(k.cancelling)} set to cancel`} />
        <Stat label="Payment issues" value={n(k.seg["at-risk"])} note="Past due or on hold" />
        <Stat href="/admin/payouts?tab=requested" label="Payouts pending" value={n(s.openPayouts)} note={`${fmtUsd(s.openPayoutCents)} to pay`} />
        <Stat href="/admin/referrals?status=available" label="Commissions available" value={fmtUsd(s.availableCents)} note={`${n(s.availableCount)} not yet requested`} />
        <Stat href="/admin/alerts?sent=yes&range=7d" label="Alerts sent (7 days)" value={n(s.alerts)} note="Down, recovery, SSL, domain" />
        <Stat href="/admin/messages?state=all&range=7d" label="Messages (7 days)" value={n(s.messages)} note={`${n(s.unread)} open`} />
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Panel
          title={`Sign-ups, last ${days} days`}
          action={
            <span className="flex gap-1 text-xs">
              {Object.keys(RANGES).map((r) => (
                <Link key={r} href={`/admin?days=${r}`} aria-current={String(days) === r ? "true" : undefined} className={`border px-2 py-0.5 ${String(days) === r ? "border-accent bg-accent text-white" : "border-rule text-muted hover:text-ink"}`}>{r}d</Link>
              ))}
            </span>
          }
        >
          <div className="px-4 py-4"><BarChart data={series} label="Sign-ups per day" /></div>
        </Panel>
        <div className="grid gap-px border border-rule bg-rule">
          <Meter label="Worker check capacity" used={k.capacity.perMin} limit={k.capacity.limit} unit="checks/min" note="Free Cloudflare Worker budget. Legacy Free sites count as 1 check every 5 min, Custom sites past 100 every 3 min." />
          <Meter label="Emails, last 24 hours (estimate)" used={k.emails.total} limit={k.emails.limit} unit="sent" note={`Resend free plan. Alerts ${k.emails.parts.alerts} · reports ${k.emails.parts.reports} · codes ${k.emails.parts.codes} · resets ${k.emails.parts.resets} · contact ${k.emails.parts.contact}`} />
        </div>
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Panel title="Plan mix">
          <ShareList
            rows={PLAN_BUCKETS.map((key) => ({
              key,
              label: <Link href={`/admin/users?plan=${PLAN_BUCKET_FILTER[key]}`} className="hover:text-accent hover:underline">{PLAN_BUCKET_LABEL[key]}</Link>,
              n: k.plans[key],
            }))}
          />
        </Panel>
        <Panel title="Top countries" action={<Link href="/admin/users?sort=active" className="text-xs text-accent hover:underline">Users</Link>}>
          <ShareList rows={countries.map((c) => ({ key: c.country, label: countryName(c.country), n: c.n }))} empty="Location appears after users sign in on the live site." />
        </Panel>
        <Panel title="Sign-up sources">
          <ShareList rows={sources.map((x) => ({ key: x.source, label: x.source, n: x.n }))} empty="Sources are recorded for new sign-ups." />
        </Panel>
      </div>

      <RecentUsers signups={s.signups} activity={s.activity} />
    </div>
  );
}
