import { CHANNEL_KINDS, KIND_LABEL, type ChannelKind } from "@/lib/channels/types";
import { alertsSentWhen } from "@/lib/monitor/config";
import { KindMark } from "@/components/dash/alerts/KindMark";
import { Panel } from "@/components/dash/ui";
import { PreviewFrame } from "./PreviewFrame";
import { shareChannels, shareEmailRows } from "./share-data";

const BLURB: Record<ChannelKind, string> = {
  slack: "Post to a channel",
  discord: "Post to a server channel",
  telegram: "Message you or a group",
  webhook: "Signed JSON to your URL",
};

function Switch({ on }: { on: boolean }) {
  return (
    <span className={`relative mt-0.5 h-6 w-11 shrink-0 border ${on ? "border-accent bg-accent" : "border-rule bg-bg"}`}>
      <span className={`absolute top-0.5 block h-4 w-4 ${on ? "left-[22px] bg-white" : "left-0.5 bg-muted"}`} />
    </span>
  );
}

/** Inert replica of /dashboard/alerts: email prefs plus Slack, Discord, Telegram and webhook rows. */
export function AlertsPreview() {
  return (
    <PreviewFrame
      url="websiteswithpunch.com/dashboard/alerts"
      label="Preview of the Alerts & integrations screen, with email preferences and Slack, Discord and Telegram channels."
    >
      <div className="bg-bg px-3 py-5 sm:px-5 sm:py-6">
        <p className="font-display text-2xl font-medium text-ink">Alerts & integrations</p>
        <p className="mt-1 max-w-2xl text-sm text-muted">
          Alerts are emailed to you. Add Slack, Discord, Telegram or a webhook, and choose which alerts each one gets.
        </p>

        <div className="mt-5 space-y-5">
          <Panel title={`Chat and webhooks · ${shareChannels.length}/10`}>
            <ul>
              {shareChannels.map((c) => (
                <li key={c.name} className="flex flex-col gap-3 border-b border-rule px-4 py-4 last:border-b-0 sm:flex-row sm:items-center">
                  <div className="flex min-w-0 flex-1 items-start gap-3">
                    <KindMark kind={c.kind} />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-ink">{c.name}</p>
                      <p className="truncate text-xs text-muted">
                        {KIND_LABEL[c.kind]} · {c.hint} · {c.events} · {c.scope}
                      </p>
                      <p className="mt-0.5 text-xs text-muted">Last delivered {c.last}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-1 text-sm text-muted sm:justify-end">
                    <span className="border border-rule px-3 py-1.5 text-xs font-medium text-ink">Send test</span>
                    <span className="px-2 py-1 text-sm">Edit</span>
                    <span className="px-2 py-1 text-sm">Pause</span>
                  </div>
                </li>
              ))}
            </ul>
            <div className="border-t border-rule p-4">
              <p className="mb-3 text-sm text-muted">Add another channel</p>
              <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                {CHANNEL_KINDS.map((k) => (
                  <span key={k} className="flex items-start gap-3 border border-rule bg-bg p-3">
                    <KindMark kind={k} size="h-8 w-8" />
                    <span className="min-w-0">
                      <span className="block text-sm font-medium text-ink">{KIND_LABEL[k]}</span>
                      <span className="block text-xs leading-snug text-muted">{BLURB[k]}</span>
                    </span>
                  </span>
                ))}
              </div>
            </div>
          </Panel>

          <section className="border border-rule bg-surface">
            <div className="border-b border-rule px-6 py-4">
              <p className="label-caps text-muted">Email alerts</p>
              <p className="mt-1 text-sm text-muted">
                Sent to <span className="text-ink">alex@studio.example</span> {alertsSentWhen()}
              </p>
            </div>
            <ul className="divide-y divide-rule">
              {shareEmailRows.map((r) => (
                <li key={r.title} className="flex items-start justify-between gap-4 px-6 py-4">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-ink">{r.title}</p>
                    <p className="mt-0.5 text-xs leading-5 text-muted">{r.body}</p>
                  </div>
                  <Switch on={r.on} />
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </PreviewFrame>
  );
}
