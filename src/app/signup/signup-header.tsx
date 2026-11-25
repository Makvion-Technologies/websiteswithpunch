"use client";

import Link from "next/link";
import { CUSTOM } from "@/lib/plans";
import type { BillingInterval } from "@/lib/billing-interval";
import {
  CHOICE_IDS,
  DEFAULT_CUSTOM_SITES,
  choiceName,
  choicePerMonth,
  choicePriceLabel,
  choiceSites,
  hasTrial,
  parseChoice,
  type ChoiceId,
  type PlanChoice,
} from "@/lib/plan-choice";
import { BillingIntervalToggle } from "@/components/BillingIntervalToggle";
import { CustomSizeSlider } from "@/components/CustomSizeSlider";
import { AuthHeading, AuthNotice } from "@/components/auth/AuthShell";

const LABEL: Record<ChoiceId, string> = { starter: "Starter", pro: "Pro", business: "Business", custom: "Custom" };

/** Title, plan picker, billing toggle and what you'll pay. Every new account starts on a paid plan. */
export function SignupHeader({
  choice,
  onChoice,
  interval,
  onInterval,
  loading,
  canceled,
}: {
  choice: PlanChoice;
  onChoice: (c: PlanChoice) => void;
  interval: BillingInterval;
  onInterval: (v: BillingInterval) => void;
  loading: boolean;
  canceled: boolean;
}) {
  const trial = hasTrial(choice);
  const price = choicePriceLabel(choice, interval);
  const sites = choiceSites(choice);
  const perMonth = interval === "year" ? ` (${choicePerMonth(choice, interval)}/mo, 2 months free)` : "";
  const subtitle = trial
    ? `Free for 30 days, then ${price}${perMonth} for up to ${sites} sites, plus applicable tax. You'll verify your email, then add a card on Dodo Payments. Nothing is charged today, and you can cancel before the trial ends.`
    : `You'll pay ${price}${perMonth} for up to ${sites} sites, plus applicable tax shown at checkout. You'll verify your email, then pay securely on Dodo Payments.`;

  function pick(id: ChoiceId) {
    if (id === choice.id) return;
    onChoice(id === "custom" ? parseChoice("custom", DEFAULT_CUSTOM_SITES) : { id, blocks: 0 });
  }

  return (
    <>
      <AuthHeading title={trial ? "Start your free trial" : `Start ${choiceName(choice)}`} />
      <div role="radiogroup" aria-label="Plan" className="mt-4 grid grid-cols-2 gap-px border border-rule bg-rule sm:grid-cols-4">
        {CHOICE_IDS.map((id) => {
          const on = id === choice.id;
          return (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={on}
              disabled={loading}
              onClick={() => pick(id)}
              className={`flex min-h-11 flex-col items-start px-3 py-2 text-left text-sm transition-colors ${
                on ? "bg-accent text-white" : "bg-surface text-ink hover:bg-accent-soft"
              }`}
            >
              <span className="font-medium">{LABEL[id]}</span>
              <span className={`text-xs ${on ? "text-white/80" : "text-muted"}`}>
                {id === "starter" ? "30 days free" : id === "pro" ? "Most popular" : id === "business" ? "100 sites" : "125–500 sites"}
              </span>
            </button>
          );
        })}
      </div>
      {choice.id === "custom" && (
        <div className="mt-4">
          <CustomSizeSlider
            blocks={choice.blocks}
            onChange={(blocks) => onChoice({ id: "custom", blocks })}
            interval={interval}
            minBlocks={CUSTOM.minBlocks}
            disabled={loading}
          />
        </div>
      )}
      <BillingIntervalToggle value={interval} onChange={onInterval} disabled={loading} className="mt-4 self-start" />
      <p className="mt-3 text-sm leading-relaxed text-muted">{subtitle}</p>
      {canceled && (
        <AuthNotice tone="warning" className="mt-3">
          Checkout was canceled, so nothing was charged. Log in and pick a plan from Your plan when you&apos;re ready.
        </AuthNotice>
      )}
    </>
  );
}

export function signupButtonLabel(choice: PlanChoice, interval: BillingInterval) {
  return hasTrial(choice) ? "Start 30-day free trial" : `Continue to payment — ${choicePriceLabel(choice, interval)}`;
}

const legal = "underline underline-offset-2 hover:text-ink";

/** Agreement line under the button; links open in a new tab so typed details aren't lost. */
export function SignupConsent({ trial }: { trial: boolean }) {
  return (
    <p className="text-center text-xs text-muted">
      By creating an account you agree to our{" "}
      <Link href="/terms" target="_blank" rel="noopener" className={legal}>Terms</Link> and{" "}
      <Link href="/privacy" target="_blank" rel="noopener" className={legal}>Privacy Policy</Link>.
      {" "}
      {trial ? "The trial converts to a paid plan unless you cancel before it ends. " : ""}
      {(
        <>
          Payments are non-refundable; see our{" "}
          <Link href="/refund-policy" target="_blank" rel="noopener" className={legal}>
            Refund &amp; Cancellation Policy
          </Link>
          .
        </>
      )}
    </p>
  );
}
