import type { PublicStatus } from "@/lib/status-pages/load";

const COPY: Record<PublicStatus["overall"], [string, string]> = {
  up: ["All systems operational", "border-emerald-600/25 bg-emerald-50 text-emerald-800 dark:border-emerald-400/30 dark:bg-emerald-400/10 dark:text-emerald-200"],
  partial: ["Some systems are having problems", "border-amber-600/25 bg-amber-50 text-amber-900 dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-100"],
  down: ["Major outage", "border-rose-600/25 bg-rose-50 text-rose-800 dark:border-rose-400/30 dark:bg-rose-400/10 dark:text-rose-200"],
  unknown: ["Waiting for the first checks", "border-rule bg-surface text-muted"],
};

export function OverallBanner({ overall, updatedAt }: { overall: PublicStatus["overall"]; updatedAt: string }) {
  const [text, cls] = COPY[overall];
  return (
    <div className={`flex flex-wrap items-center justify-between gap-2 border px-4 py-3.5 sm:px-5 ${cls}`}>
      <p className="font-display text-base font-medium">{text}</p>
      <p className="text-xs opacity-80">
        Updated <time dateTime={updatedAt}>{updatedAt.slice(11, 16)} UTC</time>
      </p>
    </div>
  );
}
