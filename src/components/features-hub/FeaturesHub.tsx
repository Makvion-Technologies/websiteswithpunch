import Link from "next/link";
import type { ComponentType } from "react";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { SoftCta } from "@/components/seo/SoftCta";
import { AlertsVisual } from "@/components/marketing/AlertsVisual";
import { DomainVisual } from "@/components/marketing/DomainVisual";
import { ExpiryCalendarVisual } from "@/components/marketing/ExpiryCalendarVisual";
import { HeartbeatVisual } from "@/components/marketing/HeartbeatVisual";
import { SslVisual } from "@/components/marketing/SslVisual";
import { StatusPageVisual } from "@/components/marketing/StatusPageVisual";
import { UptimeBadgeVisual } from "@/components/marketing/UptimeBadgeVisual";
import { UptimeVisual } from "@/components/marketing/UptimeVisual";
import { WeeklyReportVisual } from "@/components/marketing/WeeklyReportVisual";
import { FEATURE_LINKS, TOOL_LINKS } from "@/content/links";

const VISUAL: Record<string, ComponentType> = {
  "/uptime-monitoring": UptimeVisual,
  "/ssl-certificate-monitoring": SslVisual,
  "/domain-expiry-monitoring": DomainVisual,
  "/cron-job-monitoring": HeartbeatVisual,
  "/website-alerts": AlertsVisual,
  "/status-pages": StatusPageVisual,
  "/weekly-reports": WeeklyReportVisual,
  "/expiry-calendar": ExpiryCalendarVisual,
  "/uptime-badges": UptimeBadgeVisual,
};

const FACTS = ["Uptime, SSL and domain on every site", "Alerts by email, Slack, Discord or Telegram", "Status pages, reports, calendar and badges"];

/** Feature index: short promise, a product preview per feature, then a free-tools hand-off. */
export function FeaturesHub() {
  return (
    <div>
      <section className="border-b border-rule bg-bg">
        <div className="mx-auto max-w-6xl px-4 pb-16 pt-8 sm:px-6 sm:pb-20 sm:pt-10">
          <Breadcrumbs items={[{ name: "Features", href: "/features" }]} />
          <div className="mt-10 max-w-3xl">
            <p className="label-caps text-accent">Product</p>
            <h1 className="mt-4 font-display text-[2.3rem] font-medium leading-[1.04] tracking-[-0.035em] text-ink sm:text-[3.25rem] lg:text-[2.85rem]">
              Everything Websites With Punch <span className="text-accent">watches</span>, and everything you can share
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
              One dashboard for uptime, SSL certificate expiry and domain expiry, plus alerts, a
              public status page, a weekly report, an expiry calendar and uptime badges.
            </p>
            <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink">
              {FACTS.map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <span aria-hidden className="h-1.5 w-1.5 bg-accent" />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="border-b border-rule bg-bg" aria-labelledby="feature-cards-title">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <h2 id="feature-cards-title" className="font-display text-3xl font-medium text-ink sm:text-4xl">
            The product, one page at a time
          </h2>
          <p className="mt-3 max-w-xl text-muted">Each page is a closer look at something the dashboard already does.</p>
          <ul className="mt-14 grid gap-8 md:grid-cols-2">
            {FEATURE_LINKS.map((l) => {
              const Visual = VISUAL[l.href];
              return (
                <li key={l.href} className="flex min-w-0 flex-col border border-rule bg-surface">
                  {Visual ? (
                  <div className="max-h-[280px] overflow-hidden border-b border-rule">
                    <Visual />
                  </div>
                ) : null}
                  <div className="flex flex-1 flex-col p-5 sm:p-6">
                    <h3 className="font-display text-xl font-medium text-ink">{l.title}</h3>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{l.body}</p>
                    <Link href={l.href} className="mt-3 inline-flex min-h-10 items-center self-start text-sm font-medium text-ink underline decoration-rule underline-offset-4 hover:decoration-ink">
                      {l.title} →
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <section className="border-b border-rule bg-bg" aria-labelledby="features-tools-title">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 id="features-tools-title" className="font-display text-3xl font-medium text-ink sm:text-4xl">
            Free tools, no account needed
          </h2>
          <p className="mt-3 max-w-xl text-muted">Check a site once, then come back here when you want ongoing monitoring.</p>
          <ul className="mt-8 grid gap-px border border-rule bg-rule sm:grid-cols-3">
            {TOOL_LINKS.map((l) => (
              <li key={l.href} className="bg-bg">
                <Link href={l.href} className="block h-full px-5 py-5 hover:bg-surface">
                  <span className="font-display text-base font-medium text-ink">{l.title} →</span>
                  <span className="mt-1.5 block text-sm leading-relaxed text-muted">{l.body}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <SoftCta
          title="Start monitoring with a free trial"
          body="Starter covers 10 sites for $5/month and is free for 30 days. Every plan includes uptime, SSL and domain checks, alerts, a status page, a weekly report, an expiry calendar and badges."
        />
      </div>
    </div>
  );
}
