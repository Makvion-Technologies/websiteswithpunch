import Link from "next/link";
import { AlertsPreview } from "./AlertsPreview";
import { CalendarReportPreview } from "./CalendarReportPreview";
import { StatusSharePreview } from "./StatusSharePreview";
import { shareAlertsCaption, shareStatusCaption } from "./share-data";

const linkClass = "font-medium text-ink underline decoration-rule underline-offset-4 hover:decoration-ink";

/** Feature-page links under a caption: one row that wraps, each at least 40px tall for touch. */
function FeatureLinks({ links }: { links: [href: string, label: string][] }) {
  return (
    <ul className="mt-1 flex flex-wrap gap-x-5 text-sm">
      {links.map(([href, label]) => (
        <li key={href}>
          <Link href={href} className={`inline-flex min-h-10 items-center ${linkClass}`}>{label} →</Link>
        </li>
      ))}
    </ul>
  );
}

/**
 * "Stay informed, and share it": product replicas of alerts, a public status page,
 * the expiry calendar, the weekly report and uptime badges. Captions link to the feature pages.
 */
export function ShareSection() {
  return (
    <section id="share" className="border-b border-rule bg-bg">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="max-w-xl">
          <p className="label-caps text-accent">Alerts and sharing</p>
          <h2 className="mt-3 font-display text-3xl font-medium text-ink sm:text-4xl">Stay informed, and share it</h2>
          <p className="mt-3 text-muted">
            When something changes, we email you and any Slack, Discord, Telegram or webhook
            channels you connect. Publish a status page for clients, get a weekly report, keep
            renewals on a calendar, and embed an uptime badge.{" "}
            <Link href="/features" className={`inline-block py-2.5 -my-2.5 ${linkClass}`}>See all features</Link>
          </p>
        </div>

        <div className="mt-14 space-y-16 sm:space-y-20">
          <div>
            <p className="label-caps text-accent">Get told</p>
            <h3 className="mt-2 font-display text-2xl font-medium text-ink sm:text-3xl">Alerts where you already work</h3>
            <p className="mt-3 max-w-xl text-base leading-relaxed text-muted">
              Email is always on. Add Slack, Discord, Telegram or a signed webhook, pick the events
              and sites each one gets, and send a test before you rely on it.
            </p>
            <div className="mt-8 border border-rule bg-[hsl(var(--ink)/0.03)] p-3 sm:p-5">
              <AlertsPreview />
            </div>
            <p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted">{shareAlertsCaption}</p>
            <FeatureLinks links={[["/website-alerts", "Website alerts"]]} />
          </div>

          <div>
            <p className="label-caps text-accent">Show it</p>
            <h3 className="mt-2 font-display text-2xl font-medium text-ink sm:text-3xl">A status page, a calendar, a weekly email</h3>
            <p className="mt-3 max-w-xl text-base leading-relaxed text-muted">
              Publish a page at websiteswithpunch.com/status/your-name, subscribe to an expiry
              calendar from Google Calendar, Outlook or Apple Calendar, and opt in to a weekly report.
            </p>
            <div className="mt-8 grid grid-cols-1 items-start gap-6 border border-rule bg-surface p-3 sm:p-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-8">
              <StatusSharePreview />
              <CalendarReportPreview />
            </div>
            <p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted">{shareStatusCaption}</p>
            <FeatureLinks
              links={[
                ["/status-pages", "Status pages"],
                ["/expiry-calendar", "Expiry calendar"],
                ["/weekly-reports", "Weekly reports"],
                ["/uptime-badges", "Uptime badges"],
              ]}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
