"use client";

import { useId } from "react";
import { CUSTOM, customSites } from "@/lib/plans";
import { blockPrice, sizedPrice, type BillingInterval } from "@/lib/billing-interval";

/**
 * Custom size picker: a range input in steps of 25 sites. `minBlocks` 0 allows plain Business
 * (100 sites, used by Change size); the pricing page starts at 1 (125 sites).
 */
export function CustomSizeSlider({
  blocks,
  onChange,
  interval,
  minBlocks = CUSTOM.minBlocks,
  maxBlocks = CUSTOM.maxBlocks,
  disabled = false,
  compact = false,
}: {
  blocks: number;
  onChange: (blocks: number) => void;
  interval: BillingInterval;
  minBlocks?: number;
  maxBlocks?: number;
  disabled?: boolean;
  compact?: boolean;
}) {
  const id = useId();
  const sites = customSites(blocks);
  const short = interval === "year" ? "yr" : "mo";
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-sm font-medium text-ink">
          Sites
        </label>
        <p className="text-sm tabular-nums text-ink">
          <span className="font-display text-xl font-medium">{sites}</span>
          {!compact && (
            <span className="text-muted"> · ${sizedPrice("business", blocks, interval)}/{short}</span>
          )}
        </p>
      </div>
      <input
        id={id}
        type="range"
        min={minBlocks}
        max={maxBlocks}
        step={1}
        value={blocks}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-valuetext={`${sites} sites`}
        className="mt-2 w-full accent-[#1F6FEB] disabled:opacity-60"
      />
      <div className="mt-1 flex justify-between text-[11px] tabular-nums text-muted" aria-hidden>
        <span>{customSites(minBlocks)}</span>
        <span>{customSites(maxBlocks)}</span>
      </div>
      {!compact && (
        <p className="mt-2 text-xs leading-relaxed text-muted">
          Business ($
          {sizedPrice("business", 0, interval)}/{short}, 100 sites) + ${blockPrice(interval)}/{short} for every 25 more.
          The first 100 sites are checked every minute, the rest every 3 minutes.
        </p>
      )}
    </div>
  );
}
