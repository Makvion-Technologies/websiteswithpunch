"use client";

import { readJson } from "@/lib/read-json";
import { useCallback, useEffect, useState } from "react";
import { CustomSizeSlider } from "@/components/CustomSizeSlider";
import { KeepSitesPicker, type KeepSiteOption } from "@/components/KeepSitesPicker";
import { ModalShell, NoRefundNote, PreviewSkeleton, primaryBtn, secondaryBtn, useEscapeClose } from "@/components/billing/modal-bits";
import type { ResizePreview } from "@/components/billing/types";
import type { BillingInterval } from "@/lib/billing-interval";
import { customSites } from "@/lib/plans";
import { TAX_NOTE_SAVED_CARD, taxLine } from "@/lib/tax-copy";

type Props = {
  open: boolean;
  /** Blocks on the subscription today (the paid-for size). */
  currentBlocks: number;
  interval: BillingInterval;
  keepOptions: KeepSiteOption[];
  onClose: () => void;
  /** POST /api/billing/resize; returns an error message or null. */
  onConfirm: (blocks: number, keepSiteIds?: string[]) => Promise<string | null>;
};

/** Change size: Business (100) ↔ Custom (125–500). Bigger now (prorated), smaller at renewal. */
export function CustomSizeFlow({ open, currentBlocks, interval, keepOptions, onClose, onConfirm }: Props) {
  const [blocks, setBlocks] = useState(currentBlocks);
  const [preview, setPreview] = useState<ResizePreview | null>(null);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pick, setPick] = useState(false);

  useEffect(() => {
    if (open) {
      setBlocks(currentBlocks);
      setPreview(null);
      setError(null);
      setPick(false);
    }
  }, [open, currentBlocks]);

  const load = useCallback(async (n: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/billing/resize?blocks=${n}`);
      const data = await readJson(res);
      if (!res.ok) {
        setPreview(null);
        setError(data.error || "Could not load the price.");
        return;
      }
      setPreview(data as ResizePreview);
    } catch {
      setError("Could not load the price.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced preview while the slider moves.
  useEffect(() => {
    if (!open) return;
    if (blocks === currentBlocks) {
      setPreview(null);
      return;
    }
    const t = setTimeout(() => void load(blocks), 350);
    return () => clearTimeout(t);
  }, [open, blocks, currentBlocks, load]);

  useEscapeClose(open && !pick, onClose);
  if (!open) return null;

  async function submit(keep?: string[]) {
    setBusy(true);
    const err = await onConfirm(blocks, keep);
    setBusy(false);
    if (err) setError(err);
  }

  if (pick && preview) {
    return (
      <KeepSitesPicker
        open
        title={`Keep ${preview.sites} sites`}
        maxKeep={preview.sites}
        sites={keepOptions}
        confirmLabel="Book smaller size"
        loading={busy}
        onClose={() => setPick(false)}
        onConfirm={(ids) => void submit(ids)}
        confirmDetail={() => (
          <p>
            Your plan stays at {preview.currentSites} sites until {preview.effectiveAtFormatted || "renewal"}. Sites you don&apos;t pick are
            locked then (not deleted).
          </p>
        )}
      />
    );
  }

  const unchanged = blocks === currentBlocks;
  return (
    <ModalShell titleId="custom-size-title" onClose={onClose}>
      <h2 id="custom-size-title" className="font-display text-xl font-medium text-ink">
        Change size
      </h2>
      <p className="mt-1 text-sm text-muted">Now: {customSites(currentBlocks)} sites.</p>
      <div className="mt-4">
        <CustomSizeSlider blocks={blocks} interval={interval} minBlocks={0} onChange={setBlocks} disabled={busy} />
      </div>
      <div className="mt-4 min-h-[5rem] space-y-2 text-sm leading-relaxed text-muted">
        {unchanged && <p>Move the slider to pick a new size.</p>}
        {!unchanged && loading && <PreviewSkeleton />}
        {!unchanged && !loading && preview && preview.action === "increase" && (
          <>
            <p className="font-display text-2xl font-medium text-ink">Pay {preview.amountDueTodayFormatted} today</p>
            <p>
              That&apos;s the new size for a full {interval === "year" ? "year" : "month"}, minus a credit for the unused part of your
              current size. Then {preview.newRecurringFormatted} ({preview.recurringBreakdown}), next on {preview.nextRenewalFormatted || "your new renewal date"}.
            </p>
            <p className="text-xs">
              {taxLine(preview.taxTodayFormatted) ? `${taxLine(preview.taxTodayFormatted)}. ` : ""}
              {TAX_NOTE_SAVED_CARD}
            </p>
          </>
        )}
        {!unchanged && !loading && preview && preview.action === "decrease" && (
          <>
            <p className="font-display text-2xl font-medium text-ink">Nothing to pay today</p>
            <p>
              You keep {preview.currentSites} sites until {preview.effectiveAtFormatted || "renewal"}. From then you pay {preview.newRecurringFormatted}.
              {preview.needsKeepPicker ? ` You have ${preview.activeCount} active sites, so next you'll choose the ${preview.sites} that stay active.` : ""}
            </p>
          </>
        )}
        {!unchanged && !loading && preview && preview.action === "undo" && <p>This cancels the smaller size you booked. Nothing is charged.</p>}
        {error && <p className="text-danger">{error}</p>}
        {!unchanged && <NoRefundNote keep={preview?.action === "decrease"} />}
      </div>
      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          disabled={busy || loading || unchanged || !preview}
          onClick={() => (preview?.action === "decrease" && preview.needsKeepPicker ? setPick(true) : void submit())}
          className={primaryBtn}
        >
          {busy
            ? "Working…"
            : preview?.action === "increase"
              ? `Pay ${preview.amountDueTodayFormatted} and grow`
              : preview?.action === "decrease"
                ? "Book smaller size"
                : "Confirm"}
        </button>
        <button type="button" onClick={onClose} disabled={busy} className={secondaryBtn}>
          Cancel
        </button>
      </div>
    </ModalShell>
  );
}
