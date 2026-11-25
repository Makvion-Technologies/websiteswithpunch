"use client";

import Link from "next/link";
import { UpgradeModals } from "@/components/UpgradeModals";
import { usePlanUpgrade } from "@/components/usePlanUpgrade";

const primary =
  "rounded-none bg-accent px-3 py-1.5 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-60";

/** No plan: "Choose a plan" (to /plan). Starter / Pro: the next plan up. Business: nothing. */
export function NavUpgradeButtons() {
  const upgrade = usePlanUpgrade();
  const { targets, loading, plan } = upgrade;

  if (targets.length === 0) return null;
  if (plan === "free") {
    return (
      <div className="hidden items-center gap-2 md:flex">
        <Link href="/plan" className={primary}>
          See plans
        </Link>
      </div>
    );
  }
  const next = targets[0];
  return (
    <>
      <div className="hidden items-center gap-2 md:flex">
        <button type="button" onClick={() => upgrade.startUpgrade(next)} disabled={loading !== null} className={primary}>
          Upgrade to {upgrade.nameOf(next)}
        </button>
      </div>
      <UpgradeModals upgrade={upgrade} />
    </>
  );
}
