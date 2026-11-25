"use client";

import { PLANS, type PlanId } from "@/lib/plans";
import { KeepSitesPicker, type KeepSiteOption } from "@/components/KeepSitesPicker";
import { ModalShell, NoRefundNote, dangerBtn, secondaryBtn, useEscapeClose } from "@/components/billing/modal-bits";

type Props = {
  open: boolean;
  plan: PlanId;
  keepOptions: KeepSiteOption[];
  endsOn: string | null;
  /** Account from before paid-only pricing: falls back to Free (1 site). */
  legacyFree?: boolean;
  /** Cancelling during the Starter free trial: nothing is ever charged. */
  inTrial?: boolean;
  loading: boolean;
  onClose: () => void;
  onConfirm: (siteIds: string[]) => void;
};

export function CancelPlanFlow({
  open,
  plan,
  keepOptions,
  endsOn,
  legacyFree = true,
  inTrial = false,
  loading,
  onClose,
  onConfirm,
}: Props) {
  const when = endsOn || "the end of the period you've paid for";
  if (!legacyFree) {
    return (
      <PausingCancel
        open={open}
        name={PLANS[plan].name}
        when={when}
        inTrial={inTrial}
        loading={loading}
        onClose={onClose}
        onConfirm={() => onConfirm([])}
      />
    );
  }
  return (
    <KeepSitesPicker
      open={open}
      title="Cancel plan"
      maxKeep={1}
      sites={keepOptions}
      confirmLabel="Cancel plan"
      loading={loading}
      onClose={onClose}
      onConfirm={onConfirm}
      skipPickWhenAll
      confirmDetail={(sel, locked) => (
        <>
          <p>
            You keep {PLANS[plan].name} until {when}. After that you&apos;re on Free (1 site). No
            more payments.
          </p>
          {locked.length > 0 && (
            <p className="mt-2">
              On {when}, these sites will be locked: {locked.map((s) => s.name).join(", ")}. They
              won&apos;t be checked and their details will be hidden. Nothing is deleted. Upgrade
              anytime to unlock them.
            </p>
          )}
          {sel[0] && (
            <p className="mt-2 font-medium text-ink">Staying active: {sel[0].name}</p>
          )}
          <NoRefundNote keep className="mt-2" />
        </>
      )}
    />
  );
}

/** Newer accounts have no Free fallback: monitoring pauses when the plan ends (nothing deleted). */
function PausingCancel({
  open,
  name,
  when,
  inTrial,
  loading,
  onClose,
  onConfirm,
}: {
  open: boolean;
  name: string;
  when: string;
  inTrial: boolean;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  useEscapeClose(open, onClose);
  if (!open) return null;
  return (
    <ModalShell titleId="cancel-plan-title" onClose={onClose}>
      <h2 id="cancel-plan-title" className="font-display text-xl font-medium text-ink">
        {inTrial ? "Cancel your free trial" : "Cancel plan"}
      </h2>
      <div className="mt-4 space-y-2 text-sm leading-relaxed text-muted">
        {inTrial ? (
          <p>
            Your trial keeps running until {when}, then it ends and you&apos;re never charged.
          </p>
        ) : (
          <p>You keep {name} until {when}. No more payments after that.</p>
        )}
        <p>
          From {when}, monitoring pauses: no checks and no alerts. Your sites and history stay in
          your account, and picking a plan again turns everything back on.
        </p>
        {!inTrial && <NoRefundNote keep />}
      </div>
      <div className="mt-5 flex flex-wrap gap-3">
        <button type="button" onClick={onConfirm} disabled={loading} className={dangerBtn}>
          {loading ? "Working…" : inTrial ? "Cancel trial" : "Cancel plan"}
        </button>
        <button type="button" onClick={onClose} disabled={loading} className={secondaryBtn}>
          Keep {inTrial ? "trial" : "plan"}
        </button>
      </div>
    </ModalShell>
  );
}
