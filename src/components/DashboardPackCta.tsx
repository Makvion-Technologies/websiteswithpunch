import Link from "next/link";
import { CUSTOM, type PlanId } from "@/lib/plans";

/**
 * Monitors header: the way to more sites. Starter / Pro: the next plan up; Business / Custom:
 * a bigger Custom size (both on /plan). No plan: choose one. Name kept for existing imports.
 */
export function DashboardPackCta({ plan, sitePackCount }: { plan: PlanId; sitePackCount: number }) {
  const atMax = plan === "business" && sitePackCount >= CUSTOM.maxBlocks;
  if (atMax) {
    return (
      <Link href="/contact?topic=custom-limits" className="text-sm text-muted underline-offset-2 hover:text-ink hover:underline">
        Need more than 500 sites?
      </Link>
    );
  }
  const label = plan === "free" ? "See plans" : plan === "business" ? "Add sites" : "Get more sites";
  return (
    <Link
      href="/plan"
      className="rounded-none border border-rule bg-surface px-4 py-2 text-sm font-medium text-ink hover:bg-accent-soft"
    >
      {label}
    </Link>
  );
}
