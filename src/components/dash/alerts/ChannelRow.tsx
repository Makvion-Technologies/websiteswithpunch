"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/Toast";
import { ConfirmModal } from "@/components/ConfirmModal";
import { EVENT_LABEL, KIND_LABEL, type ClientChannel } from "@/lib/channels/types";
import { LocalTime } from "@/components/dash/LocalTime";
import { BTN_GHOST } from "@/components/dash/ui";
import { KindMark } from "./KindMark";

const json = { "Content-Type": "application/json" };

export function ChannelRow({ c, siteCount, onEdit }: { c: ClientChannel; siteCount: number; onEdit: () => void }) {
  const router = useRouter();
  const { toast } = useToast();
  const [busy, setBusy] = useState<string | null>(null);
  const [confirm, setConfirm] = useState(false);
  const [secret, setSecret] = useState<string | null>(null);

  async function call(what: string, url: string, method: string, body?: unknown) {
    setBusy(what);
    try {
      const res = await fetch(url, { method, headers: json, body: JSON.stringify(body ?? {}) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast(data.error || "That didn't work.", "error");
        return null;
      }
      return data;
    } catch {
      toast("Network error", "error");
      return null;
    } finally {
      setBusy(null);
    }
  }

  async function test() {
    if (await call("test", `/api/channels/${c.id}/test`, "POST")) toast(`Test sent to ${c.name}.`, "success");
    router.refresh();
  }
  async function pause() {
    if (await call("pause", `/api/channels/${c.id}`, "PATCH", { enabled: !c.enabled })) router.refresh();
  }
  async function remove() {
    if (await call("delete", `/api/channels/${c.id}`, "DELETE")) {
      setConfirm(false);
      toast("Channel removed.", "success");
      router.refresh();
    }
  }
  async function reveal() {
    const d = await call("secret", `/api/channels/${c.id}/secret`, "POST");
    if (d?.signingSecret) setSecret(d.signingSecret);
  }

  const events = c.events.length >= 4 ? "All alerts" : c.events.map((e) => EVENT_LABEL[e]).join(", ");
  return (
    <li className="flex flex-col gap-3 border-b border-rule px-4 py-4 last:border-b-0 sm:flex-row sm:items-center">
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <KindMark kind={c.kind} />
        <div className="min-w-0">
          <p className="flex flex-wrap items-center gap-x-2 text-sm font-medium text-ink">
            <span className="truncate">{c.name}</span>
            {!c.enabled && <span className="border border-rule px-1.5 text-[11px] font-normal text-muted">Paused</span>}
          </p>
          <p className="truncate text-xs text-muted">
            {KIND_LABEL[c.kind]} · {c.hint} · {events} · {c.allSites ? "All sites" : `${c.siteIds.length} of ${siteCount} sites`}
          </p>
          {c.lastError ? (
            <p className="mt-0.5 text-xs text-danger">Last delivery failed: {c.lastError}</p>
          ) : c.lastSentAt ? (
            <p className="mt-0.5 text-xs text-muted">
              Last delivered <LocalTime iso={c.lastSentAt} />
            </p>
          ) : null}
          {secret && (
            <p className="mt-1 break-all font-mono text-xs text-ink">
              Signing secret: {secret}
            </p>
          )}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-1 sm:justify-end">
        <button type="button" onClick={test} disabled={!!busy} className="border border-rule px-3 py-1.5 text-xs font-medium text-ink hover:border-accent hover:text-accent disabled:opacity-60">
          {busy === "test" ? "Sending…" : "Send test"}
        </button>
        <button type="button" onClick={onEdit} className={BTN_GHOST}>Edit</button>
        {c.kind === "webhook" && !secret && (
          <button type="button" onClick={reveal} disabled={!!busy} className={BTN_GHOST}>Secret</button>
        )}
        <button type="button" onClick={pause} disabled={!!busy} className={BTN_GHOST}>{c.enabled ? "Pause" : "Resume"}</button>
        <button type="button" onClick={() => setConfirm(true)} className={`${BTN_GHOST} hover:text-danger`}>Remove</button>
      </div>
      <ConfirmModal open={confirm} onClose={() => setConfirm(false)} title={`Remove ${c.name}?`} loading={busy === "delete"} onConfirm={remove} confirmLabel="Remove">
        Alerts stop going to this {KIND_LABEL[c.kind]} channel. Email alerts are not affected.
      </ConfirmModal>
    </li>
  );
}
