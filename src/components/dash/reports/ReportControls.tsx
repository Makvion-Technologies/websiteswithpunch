"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/Toast";
import { BTN_SECONDARY, ERROR } from "@/components/dash/ui";

const json = { "Content-Type": "application/json" };

/** On/off switch (saves instantly, rolls back on error) and "Email me a preview". */
export function ReportControls({ initial, email, nextLabel }: { initial: boolean; email: string; nextLabel: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [on, setOn] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  async function flip() {
    const next = !on;
    setOn(next);
    setError(null);
    const res = await fetch("/api/reports", { method: "PATCH", headers: json, body: JSON.stringify({ weeklyReport: next }) }).catch(() => null);
    if (!res?.ok) {
      setOn(!next);
      setError("Couldn't save. Please try again.");
      return;
    }
    toast(next ? "Weekly report turned on." : "Weekly report turned off.", "success");
    router.refresh();
  }

  async function preview() {
    setSending(true);
    setError(null);
    const res = await fetch("/api/reports/preview", { method: "POST", headers: json, body: "{}" }).catch(() => null);
    const data = res ? await res.json().catch(() => ({})) : {};
    setSending(false);
    if (!res?.ok) return setError(data.error || "Couldn't send the preview.");
    toast(`Preview sent to ${email}.`, "success");
  }

  return (
    <div className="border border-rule bg-surface p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-ink">Email me a weekly report</p>
          <p className="mt-0.5 text-xs text-muted">{on ? `Next one around ${nextLabel}, to ${email}.` : `One email a week to ${email}. Off by default.`}</p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={on}
          aria-label="Weekly report"
          onClick={flip}
          className={`relative h-6 w-11 shrink-0 border transition-colors ${on ? "border-accent bg-accent" : "border-rule bg-ink/10"}`}
        >
          <span className={`absolute top-0.5 h-[18px] w-[18px] bg-white shadow transition-all ${on ? "left-[22px]" : "left-0.5"}`} />
        </button>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-rule pt-4">
        <button type="button" onClick={preview} disabled={sending} className={BTN_SECONDARY}>
          {sending ? "Sending…" : "Email me a preview"}
        </button>
        <span className="text-xs text-muted">Up to 2 previews a day.</span>
      </div>
      {error && <p className={`${ERROR} mt-3`} role="alert">{error}</p>}
    </div>
  );
}
