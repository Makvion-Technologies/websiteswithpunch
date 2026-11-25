import Link from "next/link";
import { ago } from "@/lib/activity/status";
import type { UserDetail } from "@/lib/admin/user-detail";
import { Badge, Panel } from "../ui";

const KIND: Record<string, string> = { slack: "Slack", discord: "Discord", telegram: "Telegram", webhook: "Webhook" };

/** Alert channels (only the stored non-secret hint) and status pages. */
export function IntegrationsPanel({ d, now }: { d: UserDetail; now: number }) {
  return (
    <Panel title="Alerts & status pages">
      <h3 className="label-caps border-b border-rule px-4 py-2">Alert channels ({d.channels.length})</h3>
      {d.channels.length === 0 ? <p className="px-4 py-3 text-sm text-muted">Email only.</p> : (
        <ul className="divide-y divide-rule">
          {d.channels.map((c) => (
            <li key={c.id} className="px-4 py-2.5 text-sm">
              <div className="flex items-center gap-2">
                <span className="min-w-0 flex-1 truncate text-ink">{c.name} <span className="text-muted">· {KIND[c.kind] ?? c.kind} · {c.hint}</span></span>
                <Badge tone={c.enabled ? "ok" : "muted"}>{c.enabled ? "on" : "off"}</Badge>
              </div>
              <p className="mt-0.5 text-xs text-muted">{c.events.join(", ")} · last sent {c.lastSentAt ? ago(c.lastSentAt, now) : "never"}</p>
              {c.lastError && <p className="mt-0.5 text-xs text-danger">{c.lastError}</p>}
            </li>
          ))}
        </ul>
      )}
      <h3 className="label-caps border-y border-rule px-4 py-2">Status pages ({d.pages.length})</h3>
      {d.pages.length === 0 ? <p className="px-4 py-3 text-sm text-muted">None.</p> : (
        <ul className="divide-y divide-rule">
          {d.pages.map((p) => (
            <li key={p.id} className="flex items-center gap-2 px-4 py-2.5 text-sm">
              <Link href={`/status/${p.slug}`} target="_blank" className="min-w-0 flex-1 truncate text-ink hover:text-accent">{p.title} <span className="text-muted">/status/{p.slug}</span></Link>
              <span className="text-xs text-muted">{p.siteIds.length} sites</span>
              <Badge tone={p.published ? "ok" : "muted"}>{p.published ? "live" : "draft"}</Badge>
            </li>
          ))}
        </ul>
      )}
      <p className="border-t border-rule px-4 py-2.5 text-xs text-muted">Cron job monitors: {d.user._count.heartbeats}</p>
    </Panel>
  );
}
