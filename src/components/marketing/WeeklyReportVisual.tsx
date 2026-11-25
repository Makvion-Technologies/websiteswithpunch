import { IconChart } from "./icons";
import { Panel, VisualStage } from "./monitor-visual-parts";

const TILES = [
  { k: "Uptime", v: "99.6%" },
  { k: "Incidents", v: "1" },
  { k: "Expiring", v: "2" },
];

/** Compact replica of the weekly report summary. */
export function WeeklyReportVisual() {
  return (
    <VisualStage>
      <Panel icon={<IconChart className="h-4 w-4" />} title="Weekly report" footer={<span>18–25 Nov 2026 · opt-in email</span>}>
        <div className="grid grid-cols-3 gap-px border border-rule bg-rule">
          {TILES.map((t) => (
            <div key={t.k} className="bg-surface px-2 py-3 text-center sm:px-3">
              <p className="label-caps text-muted">{t.k}</p>
              <p className="mt-1 font-display text-lg font-medium text-ink sm:text-xl">{t.v}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-sm text-ink">Launch page · 98.2% uptime · 1 incident</p>
        <p className="mt-1 text-xs text-muted">Client blog SSL in 21 days · Launch page domain in 6 days</p>
      </Panel>
    </VisualStage>
  );
}
