"use client";

import { Sk, SkBtn, SkStatus } from "./Sk";
import { useLayoutShape } from "./shape";
import { LockedSiteCardSkeleton, SiteCardSkeleton } from "./SiteCardSkeleton";
import { AnalyticsSectionSkeleton } from "./AnalyticsSkeleton";

const PLAN_NAME = { free: "Free", pro: "Pro", business: "Business" } as const;
const HEAD_BTN = "px-4 py-2 text-sm font-medium";

/** Mirrors the Monitors page: header, one card per site, inline analytics. */
export function MonitorsSkeleton() {
  const { plan, active, locked, limit, cards: remembered } = useLayoutShape();
  const paid = plan !== "free";
  const inline = active === 1 && locked === 0;
  const empty = active + locked === 0;
  // Remembered card order and text lengths when they match the counts; otherwise plain cards.
  const total = Math.min(active + locked, 12);
  const cards: Array<[number | undefined, number | undefined, number]> =
    remembered.length === total
      ? remembered
      : [
          ...Array.from({ length: active }, () => [undefined, undefined, 0] as [undefined, undefined, number]),
          ...Array.from({ length: locked }, () => [undefined, undefined, 1] as [undefined, undefined, number]),
        ].slice(0, 12);

  return (
    <div role="status" aria-busy="true">
      <SkStatus label="Loading monitors…" />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-medium">
            <Sk>Monitors</Sk>
          </h1>
          <p className="mt-1 text-sm">
            <Sk>
              {PLAN_NAME[plan]} · {active}/{limit} active. Each site gets uptime, SSL and domain checks.
            </Sk>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {active >= limit ? (
            <SkBtn outline className="px-4 py-2 text-sm">
              Site limit reached
            </SkBtn>
          ) : (
            <SkBtn className={HEAD_BTN}>Add site</SkBtn>
          )}
          {paid && (
            <SkBtn outline className={HEAD_BTN}>
              Buy +5 site slots
            </SkBtn>
          )}
        </div>
      </div>

      {empty ? (
        <div className="mt-8 border border-dashed border-rule px-6 py-12 text-center">
          <h2 className="font-display text-lg font-medium">
            <Sk>No monitors yet</Sk>
          </h2>
          <p className="mt-2 text-sm">
            <Sk>Add your first URL to start uptime, SSL, and domain monitoring.</Sk>
          </p>
          <div className="mt-6">
            <SkBtn className={HEAD_BTN}>Add your first site</SkBtn>
          </div>
        </div>
      ) : (
        <div className={inline ? "mt-8 space-y-5" : "mt-8 grid grid-cols-[repeat(auto-fill,minmax(min(100%,560px),1fr))] items-start gap-5"}>
          {cards.map(([nameLen, urlLen, isLocked], i) =>
            isLocked ? (
              <LockedSiteCardSkeleton key={i} nameLen={nameLen} urlLen={urlLen} />
            ) : (
              <SiteCardSkeleton key={i} analyticsLink={!inline} nameLen={nameLen} urlLen={urlLen} />
            ),
          )}
          {inline && <AnalyticsSectionSkeleton />}
          {!inline && active > 1 && (
            <p className="col-span-full text-center text-sm">
              <Sk>
                Open <span className="font-medium">Analytics →</span> on any active site for the
                full breakdown with range filters.
              </Sk>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
