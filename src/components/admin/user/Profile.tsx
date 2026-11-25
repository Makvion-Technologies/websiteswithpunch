import type { ReactNode } from "react";
import { countryName } from "@/lib/activity/geo";
import { ago } from "@/lib/activity/status";
import { monthlyValue, PLAN_BUCKET_LABEL, planBucketOf, SEGMENT_LABEL, segmentOf } from "@/lib/admin/plan-mix";
import { customSites } from "@/lib/plans";
import type { UserDetail } from "@/lib/admin/user-detail";
import { CopyText } from "../CopyText";
import { Badge, Panel, fmtDate } from "../ui";

export function Row({ k, children }: { k: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[7rem_minmax(0,1fr)] gap-3 sm:grid-cols-[8.5rem_minmax(0,1fr)] px-4 py-2 text-sm">
      <dt className="text-muted">{k}</dt>
      <dd className="min-w-0 break-words text-ink">{children ?? "—"}</dd>
    </div>
  );
}

const place = (city?: string | null, region?: string | null, country?: string | null) =>
  [city, region && region !== city ? region : null, countryName(country)].filter(Boolean).join(", ") || null;

export function ProfilePanel({ u, now }: { u: UserDetail["user"]; now: number }) {
  const utm = (u.signupUtm ?? null) as { medium?: string; campaign?: string; landing?: string } | null;
  return (
    <Panel title="Profile & activity">
      <dl className="divide-y divide-rule">
        <Row k="Name">{u.name}</Row>
        <Row k="Email">{u.email} {u.emailVerified ? <Badge tone="ok">verified</Badge> : <Badge>unverified</Badge>}</Row>
        <Row k="Joined">{fmtDate(u.createdAt)}</Row>
        <Row k="Last active">{u.lastActiveAt ? <>{ago(u.lastActiveAt, now)} <span className="text-muted">· {fmtDate(u.lastActiveAt)}</span></> : null}</Row>
        <Row k="Last login">{u.lastLoginAt ? <>{ago(u.lastLoginAt, now)} <span className="text-muted">· {fmtDate(u.lastLoginAt)}</span></> : null}</Row>
        <Row k="Location">{place(u.lastCity, u.lastRegion, u.lastCountry)}</Row>
        <Row k="Signed up from">{place(u.signupCity, null, u.signupCountry)}</Row>
        <Row k="Device">{u.lastDevice}</Row>
        <Row k="Source">{u.signupSource}{utm?.medium ? ` · ${utm.medium}` : ""}{utm?.campaign ? ` · ${utm.campaign}` : ""}{utm?.landing ? <span className="block text-xs text-muted">Landed on {utm.landing}</span> : null}</Row>
        <Row k="Email alerts">{[u.alertDown && "down", u.alertSsl && "SSL", u.alertDomain && "domain"].filter(Boolean).join(", ") || "all off"}{u.weeklyReport ? " · weekly report on" : ""}</Row>
      </dl>
    </Panel>
  );
}

export function BillingPanel({ u }: { u: UserDetail["user"] }) {
  const seg = segmentOf(u);
  const mrr = monthlyValue(u);
  const bucket = planBucketOf(u);
  return (
    <Panel title="Plan & billing">
      <dl className="divide-y divide-rule">
        <Row k="Plan"><Badge tone={u.plan === "free" ? "muted" : "accent"}>{PLAN_BUCKET_LABEL[bucket]}</Badge>{bucket === "custom" ? ` · ${customSites(u.sitePackCount)} sites (${u.sitePackCount} × 25 extra)` : ""} <span className="text-muted">· {SEGMENT_LABEL[seg]}</span></Row>
        {u.trialStartedAt && (
          <Row k="Trial">{`Started ${fmtDate(u.trialStartedAt, false)}`}{u.trialConvertedAt ? ` · converted ${fmtDate(u.trialConvertedAt, false)}` : u.trialEndsAt ? ` · ends ${fmtDate(u.trialEndsAt, false)}` : " · ended without converting"}</Row>
        )}
        <Row k="Monthly value">{mrr ? `$${mrr} (list price)` : "$0"}</Row>
        <Row k="Billing status">{u.dodoStatus ? <Badge tone={u.dodoStatus === "active" ? "ok" : u.dodoStatus === "past_due" || u.dodoStatus === "on_hold" ? "danger" : "muted"}>{u.dodoStatus}</Badge> : null}{u.cancelAtPeriodEnd ? " · cancels at period end" : ""}</Row>
        {u.pendingPlan && <Row k="Scheduled">{`${u.pendingPlan} from ${fmtDate(u.pendingPlanAt, false)}`}</Row>}
        {u.pendingSitePackCount != null && <Row k="Size change">{`${customSites(u.pendingSitePackCount)} sites from ${fmtDate(u.pendingPackChangeAt, false)}`}</Row>}
        <Row k="Subscription">{u.dodoSubscriptionId ? <CopyText value={u.dodoSubscriptionId} /> : null}</Row>
        <Row k="Customer">{u.dodoCustomerId ? <CopyText value={u.dodoCustomerId} /> : null}</Row>
        <Row k="Last sync">{u.dodoSyncedAt ? fmtDate(u.dodoSyncedAt) : null}</Row>
      </dl>
    </Panel>
  );
}
