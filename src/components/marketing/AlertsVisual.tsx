import { KindMark } from "@/components/dash/alerts/KindMark";
import { IconBell } from "./icons";
import { OkPill, Panel, VisualStage } from "./monitor-visual-parts";

const ROWS = [
  { kind: "slack" as const, name: "Studio Slack", hint: "#site-alerts" },
  { kind: "discord" as const, name: "Launch Discord", hint: "#status" },
  { kind: "telegram" as const, name: "On-call Telegram", hint: "Private chat" },
];

/** Compact replica of the Alerts screen: email plus Slack, Discord and Telegram. */
export function AlertsVisual() {
  return (
    <VisualStage>
      <Panel icon={<IconBell className="h-4 w-4" />} title="Alerts & integrations" badge={<OkPill live>Email on</OkPill>} footer={<span>Slack, Discord, Telegram or a webhook · no SMS</span>}>
        <ul className="space-y-3">
          {ROWS.map((r) => (
            <li key={r.name} className="flex items-center gap-3">
              <KindMark kind={r.kind} size="h-8 w-8" />
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium text-ink">{r.name}</span>
                <span className="block truncate text-xs text-muted">{r.hint} · All alerts</span>
              </span>
            </li>
          ))}
        </ul>
      </Panel>
    </VisualStage>
  );
}
