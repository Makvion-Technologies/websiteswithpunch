"use client";

import { useEffect, useState } from "react";
import { BillingIntervalToggle } from "@/components/BillingIntervalToggle";
import { CustomSizeSlider } from "@/components/CustomSizeSlider";
import {
  ModalShell,
  NoRefundNote,
  primaryBtn,
  secondaryBtn,
  useEscapeClose,
} from "@/components/billing/modal-bits";
import { TAX_NOTE_CHECKOUT } from "@/lib/tax-copy";
import { periodWord, type BillingInterval } from "@/lib/billing-interval";
import {
  TRIAL_DAYS,
  choiceName,
  choicePerMonth,
  choicePrice,
  choicePriceLabel,
  choiceSites,
  hasTrial,
  type PlanChoice,
} from "@/lib/plan-choice";

type Props = {
  /** Plan being bought (new subscription → Dodo Payments checkout); null = closed. */
  choice: PlanChoice | null;
  loading: boolean;
  message: string | null;
  /** The account already had a Starter trial: Starter is charged today. */
  trialUsed?: boolean;
  onChange?: (c: PlanChoice) => void;
  onClose: () => void;
  onConfirm: (interval: BillingInterval) => void;
};

/** No subscription → Starter / Pro / Business / Custom: pick Monthly or Annual, then Dodo checkout. */
export function CheckoutPlanModal({ choice, loading, message, trialUsed, onChange, onClose, onConfirm }: Props) {
  const [interval, setBilling] = useState<BillingInterval>("month");
  const open = choice !== null;

  useEffect(() => {
    if (open) setBilling("month");
  }, [open]);

  useEscapeClose(open, onClose);
  if (!choice) return null;

  const yearly = interval === "year";
  const trial = hasTrial(choice) && !trialUsed;
  const price = choicePriceLabel(choice, interval);

  return (
    <ModalShell titleId="checkout-plan-title" onClose={onClose}>
      <h2 id="checkout-plan-title" className="font-display text-xl font-medium text-ink">
        {trial ? "Start your 30-day free trial" : `Get ${choiceName(choice)}`}
      </h2>
      <BillingIntervalToggle value={interval} onChange={setBilling} disabled={loading} className="mt-4" />

      {choice.id === "custom" && onChange && (
        <div className="mt-4">
          <CustomSizeSlider blocks={choice.blocks} interval={interval} disabled={loading} onChange={(blocks) => onChange({ id: "custom", blocks })} />
        </div>
      )}

      <div className="mt-4 space-y-3">
        <p className="font-display text-2xl font-medium text-ink">
          {trial ? `$0 today, then ${price}` : price}
        </p>
        <p className="text-sm leading-relaxed text-muted">
          {yearly
            ? `One payment a year, which works out to ${choicePerMonth(choice, "year")} a month. That's 2 months free compared with paying monthly ($${choicePrice(choice, "month") * 12} a year).`
            : `One payment a month. Choose Annual to get 2 months free ($${choicePrice(choice, "year")} a year).`}
        </p>
        <p className="text-sm leading-relaxed text-muted">
          {trial
            ? `Up to ${choiceSites(choice)} sites. Your card is checked but not charged today. After ${TRIAL_DAYS} days you're charged ${price} unless you cancel first from Your plan. We email you 7 and 2 days before.`
            : `Up to ${choiceSites(choice)} sites. Cancel anytime and you keep your plan until the end of the ${periodWord(interval)} you've paid for.`}
        </p>
        {hasTrial(choice) && trialUsed && (
          <p className="text-sm text-muted">This account already had its free trial, so Starter is charged today.</p>
        )}
        <p className="text-xs text-muted">
          Next you&apos;ll {trial ? "add a card" : "pay"} on the secure Dodo Payments checkout (our merchant of record). {TAX_NOTE_CHECKOUT}
        </p>
        <NoRefundNote />
      </div>

      {message && <p className="mt-3 text-sm text-danger">{message}</p>}
      <div className="mt-5 flex flex-wrap gap-3">
        <button type="button" onClick={() => onConfirm(interval)} disabled={loading} className={primaryBtn}>
          {loading ? "Redirecting…" : trial ? "Start free trial" : "Continue to payment"}
        </button>
        <button type="button" onClick={onClose} disabled={loading} className={secondaryBtn}>
          Cancel
        </button>
      </div>
    </ModalShell>
  );
}
