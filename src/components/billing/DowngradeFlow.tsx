"use client";

import { KeepSitesPicker, type KeepSiteOption } from "@/components/KeepSitesPicker";
import { NoRefundNote } from "@/components/billing/modal-bits";

type Props = {
  open: boolean;
  keepOptions: KeepSiteOption[];
  renewsOn: string | null;
  /** Lower plan's price on the current interval, e.g. "$12/month" or "$120/year". */
  newPrice?: string;
  /** Current plan name ("Business", "Custom", "Pro") and the plan it moves to. */
  fromName?: string;
  toName?: string;
  /** Sites on the lower plan. */
  maxKeep?: number;
  loading: boolean;
  onClose: () => void;
  onConfirm: (siteIds: string[]) => void;
};

export function DowngradeFlow({
  open,
  keepOptions,
  renewsOn,
  newPrice = "$12/month",
  fromName = "Business",
  toName = "Pro",
  maxKeep = 30,
  loading,
  onClose,
  onConfirm,
}: Props) {
  const when = renewsOn || "your next billing date";
  return (
    <KeepSitesPicker
      open={open}
      title={`Switch to ${toName}`}
      maxKeep={maxKeep}
      sites={keepOptions}
      confirmLabel={`Switch to ${toName}`}
      loading={loading}
      onClose={onClose}
      onConfirm={onConfirm}
      skipPickWhenAll
      confirmDetail={(_sel, locked) => (
        <>
          <p>Nothing is charged today.</p>
          <p className="mt-2">
            You keep {fromName} until {when}. From {when} you&apos;ll pay {newPrice}.
          </p>
          {locked.length > 0 && (
            <p className="mt-2">
              On {when}, these {locked.length} sites will be locked:{" "}
              {locked.map((s) => s.name).join(", ")}. They won&apos;t be checked and their details
              will be hidden. Nothing is deleted. Upgrade anytime to unlock them.
            </p>
          )}
          <NoRefundNote keep className="mt-2" />
        </>
      )}
    />
  );
}
