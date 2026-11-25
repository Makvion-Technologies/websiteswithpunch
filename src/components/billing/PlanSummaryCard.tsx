"use client";

import type { ReactNode } from "react";
import { CUSTOM, CUSTOM_MAX_SITES, HIGHER_PLAN, LOWER_PLAN, PLANS, customSites, planDisplayName, type PlanId } from "@/lib/plans";
import { blockPrice, type BillingInterval } from "@/lib/billing-interval";
import { IconArrow, IconLayers, IconSliders } from "@/components/plan/icons";

type Props = {
  plan: PlanId;
  effectivePacks: number;
  interval: BillingInterval;
  cancelAtPeriodEnd: boolean;
  pendingPlan: string | null;
  pendingPlanDate: string | null;
  chooseMax: number;
  hasPendingRemoval: boolean;
  pendingSites: number;
  pendingDate: string | null;
  loading: boolean;
  /** Limit banners etc. under the size block. */
  packSlot?: ReactNode;
  /** Starter free trial running: upgrades end it. */
  inTrial?: boolean;
  onResize?: () => void;
  onUpgrade?: () => void;
  onChooseActive: () => void;
  onResume: () => void;
  onUndoPack: () => void;
  onDowngrade: () => void;
  onCancel: () => void;
  /** Shown for monthly subscribers: switch this plan to annual billing. */
  onSwitchAnnual?: () => void;
  /** Shown for annual subscribers: switch to monthly at renewal. */
  onSwitchMonthly?: () => void;
  /** Set while an annual → monthly switch is scheduled. */
  pendingMonthlyDate?: string | null;
  pendingMonthlyPrice?: string | null;
  onKeepAnnual?: () => void;
};

const calloutBtn =
  "border border-amber-300/80 bg-surface px-2.5 py-1 text-xs font-medium text-amber-900 hover:bg-amber-100/60 disabled:opacity-60 dark:border-amber-400/30 dark:bg-transparent dark:text-amber-100 dark:hover:bg-amber-400/10";

/** A booked change: what happens and when, with the buttons that change or undo it. */
function Booked({ children, actions }: { children: ReactNode; actions: ReactNode }) {
  return (
    <div className="border-b border-rule bg-amber-50/70 px-4 py-3 dark:bg-amber-400/[0.06]">
      <p className="text-sm text-amber-950 dark:text-amber-100">{children}</p>
      <div className="mt-2 flex flex-wrap gap-2">{actions}</div>
    </div>
  );
}

function Option({ onClick, disabled, children, hint, tone = "ink" }: { onClick: () => void; disabled: boolean; children: ReactNode; hint?: string; tone?: "ink" | "accent" | "danger" }) {
  const color = tone === "accent" ? "text-accent" : tone === "danger" ? "text-rose-700 dark:text-rose-300" : "text-ink";
  return (
    <button type="button" onClick={onClick} disabled={disabled} className="group flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-accent-soft/60 disabled:opacity-60">
      <span className="min-w-0 flex-1">
        <span className={`block text-sm font-medium ${color}`}>{children}</span>
        {hint && <span className="mt-0.5 block text-xs text-muted">{hint}</span>}
      </span>
      <IconArrow className="h-4 w-4 shrink-0 text-muted transition-transform group-hover:translate-x-0.5" />
    </button>
  );
}

/** "Manage plan": booked changes, plan size and the plan options. */
export function PlanSummaryCard(p: Props) {
  const paid = p.plan === "free" ? null : p.plan;
  const short = p.interval === "year" ? "yr" : "mo";
  const name = planDisplayName(p.plan, p.effectivePacks);
  const lower = paid && paid !== "starter" ? LOWER_PLAN[paid] : null;
  const higher = paid && paid !== "business" ? HIGHER_PLAN[paid] : null;
  const keepBtn = (
    <button type="button" onClick={p.onChooseActive} className={calloutBtn}>
      Change which sites stay active
    </button>
  );
  const work = (label: string) => (p.loading ? "Working…" : label);

  return (
    <section className="border border-rule bg-surface shadow-[0_1px_2px_0_hsl(var(--ink)/0.05)]">
      <header className="flex items-center gap-2 border-b border-rule px-4 py-3">
        <IconSliders className="h-4 w-4 text-muted" />
        <h2 className="label-caps flex-1 !text-ink/80">Manage plan</h2>
      </header>

      {p.cancelAtPeriodEnd && p.pendingPlanDate && (
        <Booked actions={<>{keepBtn}<button type="button" onClick={p.onResume} disabled={p.loading} className={calloutBtn}>{work("Resume plan")}</button></>}>
          {p.inTrial ? "Your free trial" : `Your ${name} plan`} ends on <b className="font-medium">{p.pendingPlanDate}</b>.{" "}
          {p.chooseMax > 0 ? `${p.chooseMax} site${p.chooseMax === 1 ? "" : "s"} will stay active.` : "Monitoring pauses then; nothing is deleted."}
        </Booked>
      )}
      {!p.cancelAtPeriodEnd && (p.pendingPlan === "pro" || p.pendingPlan === "starter") && p.pendingPlanDate && (
        <Booked actions={<>{keepBtn}<button type="button" onClick={p.onResume} disabled={p.loading} className={calloutBtn}>{work(`Keep ${name}`)}</button></>}>
          Switching to {PLANS[p.pendingPlan].name} on <b className="font-medium">{p.pendingPlanDate}</b>. {p.chooseMax} sites will stay active.
        </Booked>
      )}
      {p.pendingMonthlyDate && !p.cancelAtPeriodEnd && (
        <Booked actions={<button type="button" onClick={p.onKeepAnnual} disabled={p.loading} className={calloutBtn}>{work("Keep annual billing")}</button>}>
          Switches to monthly on <b className="font-medium">{p.pendingMonthlyDate}</b>
          {p.pendingMonthlyPrice ? ` (${p.pendingMonthlyPrice})` : ""}.
        </Booked>
      )}
      {p.hasPendingRemoval && p.pendingSites > 0 && p.pendingDate && (
        <Booked actions={<>{keepBtn}<button type="button" onClick={p.onUndoPack} disabled={p.loading} className={calloutBtn}>{work("Undo")}</button></>}>
          {p.pendingSites} site{p.pendingSites === 1 ? "" : "s"} will be locked on <b className="font-medium">{p.pendingDate}</b>.
        </Booked>
      )}

      {paid && (
        <div className="border-b border-rule px-4 py-4">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center bg-accent-soft text-accent">
              <IconLayers className="h-[18px] w-[18px]" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-ink">Plan size</p>
              <p className="mt-0.5 text-xs text-muted">
                {paid === "business"
                  ? `Grow in steps of ${CUSTOM.blockSites} sites for $${blockPrice(p.interval)}/${short} each, up to ${CUSTOM_MAX_SITES}`
                  : higher
                    ? `${PLANS[higher].name} gives you ${PLANS[higher].siteLimit} sites`
                    : ""}
              </p>
            </div>
            <p className="font-display text-2xl font-medium tabular-nums leading-none text-ink">
              {paid === "business" ? customSites(p.effectivePacks) : PLANS[paid].siteLimit}
              <span className="text-sm text-muted"> sites</span>
            </p>
          </div>
          {paid === "business" && p.onResize && !p.cancelAtPeriodEnd && (
            <button type="button" onClick={p.onResize} disabled={p.loading} className="mt-3 rounded-none bg-accent px-3 py-1.5 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-60">
              Change size
            </button>
          )}
          {higher && p.onUpgrade && (
            <button type="button" onClick={p.onUpgrade} disabled={p.loading} className="mt-3 rounded-none bg-accent px-3 py-1.5 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-60">
              Upgrade to {PLANS[higher].name}
            </button>
          )}
          {higher && p.inTrial && (
            <p className="mt-2 text-xs text-muted">Upgrading ends your free trial and charges the new plan today.</p>
          )}
          {p.packSlot && <div className="mt-1">{p.packSlot}</div>}
        </div>
      )}

      <div className="divide-y divide-rule">
        {p.onSwitchAnnual && (
          <Option onClick={p.onSwitchAnnual} disabled={p.loading} tone="accent" hint="Pay yearly and get 2 months free">
            Switch to annual billing
          </Option>
        )}
        {p.onSwitchMonthly && (
          <Option onClick={p.onSwitchMonthly} disabled={p.loading} hint="Takes effect at your renewal date">
            Switch to monthly billing
          </Option>
        )}
        {lower && !p.pendingPlan && !p.cancelAtPeriodEnd && (
          <Option onClick={p.onDowngrade} disabled={p.loading} hint={`${PLANS[lower].siteLimit} sites, from your renewal date`}>
            Switch to {PLANS[lower].name}
          </Option>
        )}
        {!p.cancelAtPeriodEnd && (
          <Option
            onClick={p.onCancel}
            disabled={p.loading}
            tone="danger"
            hint={p.inTrial ? "The trial ends on its date and you're never charged" : "Keep everything until the period you've paid for ends"}
          >
            {p.inTrial ? "Cancel free trial" : "Cancel plan"}
          </Option>
        )}
      </div>
    </section>
  );
}
