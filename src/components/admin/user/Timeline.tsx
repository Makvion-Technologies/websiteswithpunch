import { countryName } from "@/lib/activity/geo";
import type { UserDetail } from "@/lib/admin/user-detail";
import { Panel, fmtDate } from "../ui";

const LABEL: Record<string, string> = { signup: "Signed up", login: "Logged in", session: "Opened the dashboard" };

/** Sign-up, logins, new sessions and audited actions, newest first. */
export function TimelinePanel({ d }: { d: UserDetail }) {
  const items = [
    ...d.activity.map((a) => ({ id: a.id, at: a.at, text: LABEL[a.kind] ?? a.kind, sub: [a.city, countryName(a.country), a.device].filter(Boolean).join(" · "), audit: false })),
    ...d.audit.map((a) => ({ id: a.id, at: a.createdAt, text: a.action, sub: "Audit log", audit: true })),
  ].sort((a, b) => b.at.getTime() - a.at.getTime()).slice(0, 40);
  return (
    <Panel title="Activity timeline">
      {items.length === 0 ? <p className="px-4 py-6 text-sm text-muted">No activity recorded yet. Logins are recorded from this release on.</p> : (
        <ol className="relative px-4 py-3">
          {items.map((i) => (
            <li key={i.id} className="relative border-l border-rule pb-4 pl-5 last:pb-1">
              <span className={`absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-surface ${i.audit ? "bg-ink/30" : "bg-accent"}`} aria-hidden />
              <p className={`text-sm text-ink ${i.audit ? "font-mono text-xs" : ""}`}>{i.text}</p>
              <p className="text-xs text-muted">{fmtDate(i.at)}{i.sub ? ` · ${i.sub}` : ""}</p>
            </li>
          ))}
        </ol>
      )}
    </Panel>
  );
}
