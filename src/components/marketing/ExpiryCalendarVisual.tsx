import { IconGlobe } from "./icons";
import { Panel, VisualStage } from "./monitor-visual-parts";

const ROWS = [
  { day: "01", kind: "Domain", name: "Launch page", when: "in 6 days", tone: "text-rose-700 dark:text-rose-300", bar: "bg-rose-500" },
  { day: "16", kind: "SSL", name: "Client blog", when: "in 21 days", tone: "text-amber-700 dark:text-amber-300", bar: "bg-amber-500" },
  { day: "05", kind: "Domain", name: "Docs", when: "in 41 days", tone: "text-muted", bar: "bg-accent" },
];

/** Compact replica of the expiry calendar agenda. */
export function ExpiryCalendarVisual() {
  return (
    <VisualStage>
      <Panel icon={<IconGlobe className="h-4 w-4" />} title="Expiry calendar" footer={<span>Private .ics feed for Google, Outlook or Apple</span>}>
        <ul className="border border-rule">
          {ROWS.map((r) => (
            <li key={r.name} className="flex items-center gap-3 border-b border-rule px-3 py-2.5 last:border-b-0">
              <span className="w-10 shrink-0 text-center">
                <span className="block font-display text-lg font-medium leading-5 text-ink">{r.day}</span>
                <span className="block text-[10px] uppercase tracking-wide text-muted">{r.kind}</span>
              </span>
              <span className={`h-8 w-0.5 shrink-0 ${r.bar}`} />
              <span className="min-w-0 flex-1 truncate text-sm font-medium text-ink">{r.name}</span>
              <span className={`shrink-0 text-xs font-medium ${r.tone}`}>{r.when}</span>
            </li>
          ))}
        </ul>
      </Panel>
    </VisualStage>
  );
}
