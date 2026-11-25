import Link from "next/link";

type Tile = { label: string; value: string; sub: string; href: string; tone?: "bad" | "warn" | "good" };

const TONE = { bad: "text-rose-700 dark:text-rose-300", warn: "text-amber-700 dark:text-amber-300", good: "text-emerald-700 dark:text-emerald-300" };

/** Four headline numbers; each one links to where you act on it. */
export function Tiles({ tiles }: { tiles: Tile[] }) {
  return (
    <div className="grid grid-cols-2 gap-px border border-rule bg-rule lg:grid-cols-4">
      {tiles.map((t) => (
        <Link key={t.label} href={t.href} className="group bg-surface p-4 transition-colors hover:bg-bg">
          <p className="label-caps text-muted">{t.label}</p>
          <p className={`mt-1.5 font-display text-2xl font-medium ${t.tone ? TONE[t.tone] : "text-ink"}`}>{t.value}</p>
          <p className="mt-0.5 truncate text-xs text-muted group-hover:text-ink">{t.sub}</p>
        </Link>
      ))}
    </div>
  );
}
