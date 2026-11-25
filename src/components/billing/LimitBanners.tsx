"use client";

import Link from "next/link";
import { CUSTOM, CUSTOM_MAX_SITES, HIGHER_PLAN, PLANS, type PaidPlan } from "@/lib/plans";

type Props = {
  plan: PaidPlan;
  /** Custom blocks today (Business only). */
  blocks: number;
  atLimit: boolean;
  remaining: number;
  loading: boolean;
  onUpgrade: () => void;
  onResize: () => void;
};

/** Near / at the site limit: the next step up (bigger plan, bigger Custom size, or contact us). */
export function LimitBanners({ plan, blocks, atLimit, remaining, loading, onUpgrade, onResize }: Props) {
  if (!atLimit && remaining > 2) return null;
  const next = plan === "business" ? null : HIGHER_PLAN[plan];
  const canGrow = plan === "business" && blocks < CUSTOM.maxBlocks;
  const step = next
    ? `Upgrade to ${PLANS[next].name} for ${PLANS[next].siteLimit} sites.`
    : canGrow
      ? `Add 25 more sites for $${CUSTOM.blockPrice}/month with Change size (up to ${CUSTOM_MAX_SITES}).`
      : null;

  return (
    <div
      className={`mt-3 px-4 py-3 text-sm ${
        atLimit
          ? "border border-rule bg-accent-soft text-ink"
          : "border border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-100"
      }`}
    >
      <p className={atLimit ? "font-medium" : ""}>
        {atLimit ? "Every site slot is in use." : `Only ${remaining} site slot${remaining === 1 ? "" : "s"} left.`}{" "}
        {step ?? (
          <>
            Need more than {CUSTOM_MAX_SITES}?{" "}
            <Link href="/contact?topic=custom-limits" className="font-medium underline underline-offset-2">
              Contact us
            </Link>
          </>
        )}
      </p>
      {atLimit && (next || canGrow) && (
        <button
          type="button"
          onClick={next ? onUpgrade : onResize}
          disabled={loading}
          className="mt-3 rounded-none bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-60"
        >
          {next ? `Upgrade to ${PLANS[next].name}` : "Change size"}
        </button>
      )}
    </div>
  );
}
