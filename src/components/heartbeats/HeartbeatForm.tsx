"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ModalPortal, DIALOG_SCROLL } from "@/components/ModalPortal";
import { useToast } from "@/components/Toast";
import { GRACES, PERIODS, FREE_MIN_PERIOD } from "@/lib/heartbeats/config";
import type { PlanId } from "@/lib/plans";

type Initial = { id: string; name: string; periodSec: number; graceSec: number };

const FIELD = "mt-1 w-full border border-rule bg-bg px-3 py-2 text-sm text-ink";

/** Create or edit a heartbeat: name, expected period, grace time. */
export function HeartbeatForm({ open, onClose, plan, initial }: { open: boolean; onClose: () => void; plan: PlanId; initial?: Initial }) {
  const router = useRouter();
  const { toast } = useToast();
  const free = plan === "free";
  const [name, setName] = useState(initial?.name ?? "");
  const [period, setPeriod] = useState(initial?.periodSec ?? (free ? FREE_MIN_PERIOD : 300));
  const [grace, setGrace] = useState(initial?.graceSec ?? 300);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && !busy && onClose();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose, busy]);

  if (!open) return null;

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(initial ? `/api/heartbeats/${initial.id}` : "/api/heartbeats", {
        method: initial ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, periodSec: period, graceSec: grace }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) return setError(data.error || "Something went wrong.");
      toast(initial ? "Heartbeat saved." : data.ready === false ? "Heartbeat added. Its ping URL starts working within a few minutes." : "Heartbeat added. Send a ping to start it.", "success");
      onClose();
      router.refresh();
    } catch {
      setError("Network error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-solid/40 p-4" onClick={() => !busy && onClose()} role="presentation">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="hb-form-title"
          className={`${DIALOG_SCROLL} w-full max-w-lg border border-rule bg-surface p-6 shadow-lg`}
          onClick={(e) => e.stopPropagation()}
        >
          <h2 id="hb-form-title" className="font-display text-xl font-medium text-ink">
            {initial ? "Edit heartbeat" : "New heartbeat"}
          </h2>
          <p className="mb-5 mt-1 text-sm text-muted">
            Your job calls a secret URL each time it runs. If no ping arrives within the period plus grace time, we email you.
          </p>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label htmlFor="hb-name" className="block text-sm font-medium text-ink">Name</label>
              <input id="hb-name" value={name} onChange={(e) => setName(e.target.value)} required maxLength={80} className={FIELD} placeholder="Nightly database backup" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="hb-period" className="block text-sm font-medium text-ink">Expect a ping every</label>
                <select id="hb-period" value={period} onChange={(e) => setPeriod(Number(e.target.value))} className={FIELD}>
                  {PERIODS.map((p) => (
                    <option key={p.s} value={p.s} disabled={free && p.s < FREE_MIN_PERIOD}>
                      {p.label}{free && p.s < FREE_MIN_PERIOD ? " (Pro)" : ""}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="hb-grace" className="block text-sm font-medium text-ink">Grace time</label>
                <select id="hb-grace" value={grace} onChange={(e) => setGrace(Number(e.target.value))} className={FIELD}>
                  {GRACES.map((g) => (
                    <option key={g.s} value={g.s}>{g.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <p className="text-xs text-muted">
              Grace covers jobs that run long or start late. {free ? "Free heartbeats start at 1 hour; paid plans can use 5 and 15 minutes." : "We look for missed pings every minute."}
            </p>
            {error && <p className="bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}
            <div className="flex flex-wrap gap-3 pt-1">
              <button type="submit" disabled={busy} className="bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-60">
                {busy ? "Saving…" : initial ? "Save" : "Create heartbeat"}
              </button>
              <button type="button" disabled={busy} onClick={onClose} className="border border-rule px-4 py-2 text-sm text-ink hover:bg-accent-soft">
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </ModalPortal>
  );
}
