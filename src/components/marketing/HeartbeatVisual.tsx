import { IconBell, IconPulse } from "./icons";
import { OkPill, Panel, VisualStage, riseIn } from "./monitor-visual-parts";

/** Pings in the last 12 hours of an hourly job: one late run (amber), the rest on time. */
const RUNS = [1, 1, 1, 1, 1, 1, 0.5, 1, 1, 1, 1, 1];

export function HeartbeatVisual() {
  return (
    <VisualStage>
      <div className="relative pb-6 sm:pb-4">
        <Panel
          icon={<IconPulse className="h-4 w-4" />}
          title="Heartbeat"
          badge={<OkPill live>Up</OkPill>}
          footer={<span>Every 1 hour · 15 minutes grace</span>}
        >
          <div className="flex items-end justify-between gap-4">
            <div className="min-w-0">
              <p className="truncate font-display text-xl font-medium leading-tight text-ink sm:text-2xl">Nightly backup</p>
              <p className="mt-1 truncate font-mono text-[11px] text-muted">curl -fsS …/hb/k3P9…</p>
            </div>
            <div className="shrink-0 text-right">
              <p className="font-display text-lg font-medium leading-none text-ink">2 min ago</p>
              <p className="mt-1.5 text-xs text-muted">last ping</p>
            </div>
          </div>
          <div className="mt-6 flex h-8 items-end gap-1">
            {RUNS.map((r, i) => (
              <span
                key={i}
                className={`flex-1 ${r === 1 ? "bg-accent" : "bg-amber-500"}`}
                style={{ height: r === 1 ? "100%" : "55%" }}
              />
            ))}
          </div>
          <div className="mt-2 flex justify-between text-[10px] uppercase tracking-wider text-muted">
            <span>12 h ago</span>
            <span>Now</span>
          </div>
        </Panel>
        <div
          className={`absolute bottom-0 right-3 flex items-center gap-2 bg-solid px-3 py-2 text-xs text-solid-fg shadow-[4px_4px_0_0_hsl(var(--accent)/0.35)] delay-700 sm:-right-4 ${riseIn}`}
        >
          <IconBell className="h-3.5 w-3.5 shrink-0 text-accent" />
          <span className="whitespace-nowrap">Email if a run is missed</span>
        </div>
      </div>
    </VisualStage>
  );
}
