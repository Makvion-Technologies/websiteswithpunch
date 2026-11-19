"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ConfirmModal } from "@/components/ConfirmModal";
import { CARD_BTN } from "@/components/SiteCardParts";
import { formatDate } from "@/lib/utils";
import { snippets, spanText } from "@/lib/heartbeats/config";
import type { ClientHb } from "@/lib/heartbeats/types";
import type { PlanId } from "@/lib/plans";
import { HeartbeatForm } from "./HeartbeatForm";
import { CopyLine, HbBadge, Metric, rel } from "./parts";

const fmt = (ts: number) => formatDate(new Date(ts));

export function HeartbeatCard({ hb, plan, now }: { hb: ClientHb; plan: PlanId; now: number }) {
  const router = useRouter();
  const [edit, setEdit] = useState(false);
  const [del, setDel] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<"curl" | "cron" | "wget">("cron");
  const snip = snippets(hb.url, hb.periodSec);

  async function send(method: "PATCH" | "DELETE", body?: object) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/heartbeats/${hb.id}`, {
        method,
        headers: body ? { "Content-Type": "application/json" } : undefined,
        body: body ? JSON.stringify(body) : undefined,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) return setError(data.error || "Something went wrong.");
      setDel(false);
      router.refresh();
    } catch {
      setError("Network error");
    } finally {
      setBusy(false);
    }
  }

  const expected = hb.lastPing && hb.state === "up" ? hb.lastPing + hb.periodSec * 1000 : null;
  const last = hb.incidents[0];

  return (
    <article className="min-w-0 border border-rule bg-surface p-4 transition hover:border-ink/20 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-2">
        <div className="min-w-0">
          <h3 className="truncate font-display text-lg font-medium text-ink">{hb.name}</h3>
          <p className="text-xs text-muted">
            Every {spanText(hb.periodSec)} · {spanText(hb.graceSec)} grace
          </p>
        </div>
        <HbBadge state={hb.state} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
        <Metric label="Last ping" value={hb.lastPing ? rel(hb.lastPing, now) : "None yet"} sub={hb.lastPing ? fmt(hb.lastPing) : undefined} />
        <Metric
          label="Next ping expected"
          value={expected ? (expected > now ? rel(expected, now) : "Late") : hb.state === "down" ? "Overdue" : "—"}
          sub={hb.alertAt ? `Alert ${hb.alertAt > now ? rel(hb.alertAt, now) : "any moment"} if none` : undefined}
        />
        <div className="col-span-2 sm:col-span-1">
          <Metric
            label="Last missed"
            value={last ? rel(last.at, now) : "Never"}
            sub={last ? `${last.kind === "down" ? "Missed" : "Back"} · ${fmt(last.at)}` : "Last 90 days"}
          />
        </div>
      </div>

      {hb.state === "over" && (
        <p className="mt-3 text-xs text-amber-800 dark:text-amber-200">Not monitored: this heartbeat is over your plan&apos;s limit. Delete another or upgrade to use it.</p>
      )}

      <div className="mt-4 space-y-2">
        <p className="label-caps text-muted">Ping URL (GET, POST or HEAD)</p>
        <CopyLine text={hb.url} label="ping URL" />
        <div className="flex gap-1 pt-1" role="tablist" aria-label="Snippets">
          {(["cron", "curl", "wget"] as const).map((t) => (
            <button
              key={t}
              type="button"
              role="tab"
              aria-selected={tab === t}
              onClick={() => setTab(t)}
              className={`px-2.5 py-1 text-xs font-medium ${tab === t ? "bg-accent-soft text-accent" : "text-muted hover:text-ink"}`}
            >
              {t === "cron" ? "Crontab" : t}
            </button>
          ))}
        </div>
        <CopyLine text={snip[tab]} label={`${tab} snippet`} />
        <p className="text-[11px] text-muted">
          {tab === "cron" ? "The ping runs only when your job succeeds, so a failing job also alerts you." : "Add this as the last step of your job."}
        </p>
      </div>

      {error && <p className="mt-3 bg-danger/10 px-3 py-2 text-xs text-danger">{error}</p>}

      <div className="mt-4 flex flex-wrap justify-end gap-2">
        {hb.state !== "over" && (
          <button type="button" disabled={busy} onClick={() => send("PATCH", { paused: !hb.paused })} className={CARD_BTN.edit}>
            {hb.paused ? "Resume" : "Pause"}
          </button>
        )}
        <button type="button" onClick={() => setEdit(true)} className={CARD_BTN.edit}>
          Edit
        </button>
        <button type="button" disabled={busy} onClick={() => setDel(true)} className={CARD_BTN.delete}>
          Delete
        </button>
      </div>

      {edit && <HeartbeatForm open onClose={() => setEdit(false)} plan={plan} initial={hb} />}
      <ConfirmModal open={del} onClose={() => !busy && setDel(false)} title={`Delete ${hb.name}?`} loading={busy} error={error} onConfirm={() => send("DELETE")}>
        <p>This removes the heartbeat and its history. Its ping URL stops working right away.</p>
      </ConfirmModal>
    </article>
  );
}
