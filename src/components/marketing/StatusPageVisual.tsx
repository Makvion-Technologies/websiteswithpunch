import { OverallBanner } from "@/components/status-page/OverallBanner";
import { IconChart } from "./icons";
import { Panel, VisualStage } from "./monitor-visual-parts";

const ROWS = [
  { name: "My shop", host: "shop.example.com", status: "Operational", ok: true, uptime: "99.9%" },
  { name: "Launch page", host: "launch.example.io", status: "Down", ok: false, uptime: "98.2%" },
];

/** Compact replica of a public status page: overall banner and two sites. */
export function StatusPageVisual() {
  return (
    <VisualStage>
      <Panel icon={<IconChart className="h-4 w-4" />} title="status/studio-sites" footer={<span>90 days of daily uptime · light and dark</span>}>
        <OverallBanner overall="partial" updatedAt="2026-11-25T12:00:00Z" />
        <ul className="mt-3 border border-rule">
          {ROWS.map((r) => (
            <li key={r.name} className="flex items-baseline justify-between gap-3 border-b border-rule px-3 py-2.5 last:border-b-0">
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium text-ink">{r.name}</span>
                <span className="block truncate text-[11px] text-muted">{r.host} · {r.uptime} uptime</span>
              </span>
              <span className={`shrink-0 text-xs font-medium ${r.ok ? "text-emerald-700 dark:text-emerald-300" : "text-rose-700 dark:text-rose-300"}`}>{r.status}</span>
            </li>
          ))}
        </ul>
      </Panel>
    </VisualStage>
  );
}
