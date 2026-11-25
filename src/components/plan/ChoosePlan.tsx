"use client";

import { useState } from "react";
import { BillingIntervalToggle } from "@/components/BillingIntervalToggle";
import { CustomSizeSlider } from "@/components/CustomSizeSlider";
import { UpgradeModals } from "@/components/UpgradeModals";
import { usePlanUpgrade } from "@/components/usePlanUpgrade";
import { PLANS } from "@/lib/plans";
import type { BillingInterval } from "@/lib/billing-interval";
import { CHOICE_IDS, DEFAULT_CUSTOM_SITES, choicePerMonth, choicePrice, choiceSites, parseChoice, type ChoiceId, type PlanChoice } from "@/lib/plan-choice";
import { TAX_NOTE_CHECKOUT } from "@/lib/tax-copy";
import { IconSpark } from "./icons";

const NAMES: Record<ChoiceId, string> = { starter: "Starter", pro: "Pro", business: "Business", custom: "Custom" };
const BLURB: Record<ChoiceId, string> = {
  starter: "For a few sites. 30-day free trial.",
  pro: "For freelancers and small teams.",
  business: "For agencies and many clients.",
  custom: "Business features, 125 to 500 sites.",
};

/**
 * Plan picker for accounts without a subscription: legacy Free accounts (upgrade) and newer
 * accounts with no plan yet (monitoring paused until they pick one). Opens the checkout window.
 */
export function ChoosePlan({ legacyFree, trialUsed = false }: { legacyFree: boolean; trialUsed?: boolean }) {
  const upgrade = usePlanUpgrade("free");
  const [interval, setBilling] = useState<BillingInterval>("month");
  const [custom, setCustom] = useState<PlanChoice>(parseChoice("custom", DEFAULT_CUSTOM_SITES));
  const short = interval === "year" ? "yr" : "mo";

  function choiceFor(id: ChoiceId): PlanChoice {
    return id === "custom" ? custom : { id, blocks: 0 };
  }

  return (
    <section className="border border-rule bg-surface shadow-[0_1px_2px_0_hsl(var(--ink)/0.05)]">
      <header className="flex flex-wrap items-center gap-3 border-b border-rule px-4 py-3">
        <IconSpark className="h-4 w-4 text-accent" />
        <h2 className="label-caps flex-1 !text-ink/80">{legacyFree ? "Room to grow" : "Choose a plan"}</h2>
        <BillingIntervalToggle value={interval} onChange={setBilling} />
      </header>
      <div className="px-4 py-4">
        <p className="text-sm leading-relaxed text-muted">
          {legacyFree
            ? "Your Free plan stays free for life. When you're watching more sites, pick a plan: same checks, more sites, every-minute uptime checks."
            : "Pick a plan to start monitoring. Starter comes with a 30-day free trial; Pro, Business and Custom start right away."}
        </p>
        <div className="mt-4 grid gap-px border border-rule bg-rule sm:grid-cols-2 xl:grid-cols-4">
          {CHOICE_IDS.map((id) => {
            const c = choiceFor(id);
            const trial = id === "starter" && !trialUsed;
            const popular = id === "pro";
            return (
              <div key={id} className="flex flex-col bg-surface px-4 py-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-display text-lg font-medium text-ink">{NAMES[id]}</p>
                  {popular && <span className="bg-accent px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">Most popular</span>}
                  {trial && <span className="border border-accent/40 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent">30 days free</span>}
                </div>
                <p className="mt-1 text-xs text-muted">{BLURB[id]}</p>
                <p className="mt-3 tabular-nums text-ink">
                  <span className="font-display text-2xl font-medium">${choicePrice(c, interval)}</span>
                  <span className="text-xs text-muted">/{short}</span>
                </p>
                <p className="text-xs text-muted">
                  {choiceSites(c)} sites{interval === "year" ? ` · ${choicePerMonth(c, "year")}/mo` : ""}
                </p>
                {id === "custom" && (
                  <div className="mt-3">
                    <CustomSizeSlider compact blocks={custom.blocks} interval={interval} onChange={(blocks) => setCustom({ id: "custom", blocks })} />
                  </div>
                )}
                <div className="mt-auto pt-4">
                  <button
                    type="button"
                    onClick={() => upgrade.startCheckout(c)}
                    disabled={upgrade.loading !== null}
                    className={`w-full px-3 py-2 text-sm font-medium disabled:opacity-60 ${
                      popular || (trial && !legacyFree) ? "bg-accent text-white hover:bg-accent-hover" : "border border-rule bg-surface text-ink hover:bg-accent-soft"
                    }`}
                  >
                    {trial ? "Start free trial" : `Get ${NAMES[id]}`}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        <p className="mt-3 text-xs text-muted">
          {PLANS.starter.name} {PLANS.starter.siteLimit} sites, {PLANS.pro.name} {PLANS.pro.siteLimit}, {PLANS.business.name} {PLANS.business.siteLimit}. Annual billing = 2 months free. {TAX_NOTE_CHECKOUT}
        </p>
      </div>
      <UpgradeModals upgrade={upgrade} trialUsed={trialUsed} />
    </section>
  );
}
