import Link from "next/link";
import { KIND_LABEL, type ChannelKind } from "@/lib/channels/types";
import { Panel } from "@/components/dash/ui";

type Ch = { id: string; kind: string; name: string; enabled: boolean; allSites: boolean };

/** Where this site's alerts go: email preferences plus the channels that include it. */
export function SiteAlertsPanel({ email, prefs, channels, other }: { email: string; prefs: { alertDown: boolean; alertSsl: boolean; alertDomain: boolean }; channels: Ch[]; other: number }) {
  const on = (v: boolean) => (v ? "On" : "Off");
  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-2">
      <Panel title="Email" action={<Link href="/dashboard/alerts" className="text-sm font-medium text-accent hover:underline">Change →</Link>}>
        <dl className="divide-y divide-rule text-sm">
          {[["Down and recovered", prefs.alertDown], ["SSL expiry", prefs.alertSsl], ["Domain expiry", prefs.alertDomain]].map(([k, v]) => (
            <div key={String(k)} className="flex justify-between px-4 py-2.5">
              <dt className="text-ink">{k}</dt>
              <dd className={v ? "text-emerald-700 dark:text-emerald-300" : "text-muted"}>{on(Boolean(v))}</dd>
            </div>
          ))}
        </dl>
        <p className="border-t border-rule px-4 py-2.5 text-xs text-muted">Sent to {email}</p>
      </Panel>
      <Panel title="Chat and webhooks" action={<Link href="/dashboard/alerts" className="text-sm font-medium text-accent hover:underline">Manage →</Link>}>
        {channels.length === 0 ? (
          <p className="px-4 py-4 text-sm text-muted">
            {other ? `${other} channel${other === 1 ? " is" : "s are"} set up for other sites only.` : "No Slack, Discord, Telegram or webhook channels yet."}{" "}
            <Link href="/dashboard/alerts" className="font-medium text-accent hover:underline">Add one</Link>
          </p>
        ) : (
          <ul className="divide-y divide-rule">
            {channels.map((c) => (
              <li key={c.id} className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm">
                <span className="min-w-0 truncate text-ink">
                  <span className="text-muted">{KIND_LABEL[c.kind as ChannelKind] ?? c.kind}</span> · {c.name}
                </span>
                <span className="shrink-0 text-xs text-muted">{!c.enabled ? "Paused" : c.allSites ? "All sites" : "This site"}</span>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}
