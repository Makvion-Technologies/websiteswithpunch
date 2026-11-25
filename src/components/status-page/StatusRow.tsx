import type { PublicSite } from "@/lib/status-pages/load";
import { UptimeBars } from "./UptimeBars";

const LABEL: Record<string, [string, string]> = {
  up: ["Operational", "text-emerald-700 dark:text-emerald-300"],
  down: ["Down", "text-rose-700 dark:text-rose-300"],
  error: ["Having problems", "text-amber-800 dark:text-amber-200"],
  pending: ["Waiting for first check", "text-muted"],
};

export function StatusRow({ site }: { site: PublicSite }) {
  const [label, cls] = LABEL[site.status] ?? LABEL.pending;
  return (
    <li className="border-b border-rule px-4 py-4 last:border-b-0 sm:px-5">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <div className="min-w-0">
          <p className="truncate font-medium text-ink">{site.name}</p>
          <p className="truncate text-xs text-muted">{site.host}</p>
        </div>
        <p className={`text-sm font-medium ${cls}`}>{label}</p>
      </div>
      <div className="mt-3">
        <UptimeBars bars={site.bars} />
        <div className="mt-1.5 flex justify-between text-[11px] text-muted">
          <span>
            <span className="sm:hidden">30 days ago</span>
            <span className="hidden sm:inline">90 days ago</span>
          </span>
          <span>{site.uptime == null ? "No data yet" : `${site.uptime}% uptime`}</span>
          <span>Today</span>
        </div>
      </div>
    </li>
  );
}
