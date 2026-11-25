"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/Toast";
import { CHANNEL_EVENTS, EVENT_LABEL, KIND_LABEL, type ChannelEvent, type ChannelKind, type ClientChannel } from "@/lib/channels/types";
import { Dialog } from "@/components/dash/Dialog";
import { SitePicker, type PickSite } from "@/components/dash/SitePicker";
import { BTN_PRIMARY, BTN_SECONDARY, ERROR, FIELD } from "@/components/dash/ui";
import { TargetFields } from "./TargetFields";

type Props = { kind: ChannelKind; initial?: ClientChannel; sites: PickSite[]; cron: boolean; onClose: () => void };

/** Add or edit one channel: target, events, which sites. Closes itself on success. */
export function ChannelForm({ kind, initial, sites, cron, onClose }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const events = CHANNEL_EVENTS.filter((e) => cron || e !== "heartbeat");
  const [name, setName] = useState(initial?.name ?? `${KIND_LABEL[kind]} alerts`);
  const [target, setTarget] = useState<Record<string, string>>({});
  const [chosen, setChosen] = useState<ChannelEvent[]>(initial?.events ?? events);
  const [allSites, setAllSites] = useState(initial?.allSites ?? true);
  const [siteIds, setSiteIds] = useState<string[]>(initial?.siteIds ?? []);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const toggle = (e: ChannelEvent) => setChosen((c) => (c.includes(e) ? c.filter((x) => x !== e) : [...c, e]));

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!chosen.length) return setError("Pick at least one event.");
    if (!allSites && !siteIds.length) return setError("Pick at least one site, or choose All sites.");
    setBusy(true);
    setError(null);
    try {
      const body = { name, events: chosen, allSites, siteIds: allSites ? [] : siteIds, target, ...(initial ? {} : { kind }) };
      const res = await fetch(initial ? `/api/channels/${initial.id}` : "/api/channels", {
        method: initial ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) return setError(data.error || "Something went wrong.");
      toast(initial ? "Channel saved." : `${KIND_LABEL[kind]} connected. Send a test to check it.`, "success");
      onClose();
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog title={initial ? `Edit ${KIND_LABEL[kind]} channel` : `Connect ${KIND_LABEL[kind]}`} description="Alerts arrive here as well as by email." onClose={onClose} busy={busy}>
      <form onSubmit={submit} className="space-y-5">
        <TargetFields kind={kind} value={target} onChange={setTarget} editing={Boolean(initial)} />
        <div>
          <label htmlFor="ch-name" className="block text-sm font-medium text-ink">Name</label>
          <input id="ch-name" value={name} onChange={(e) => setName(e.target.value)} required maxLength={60} placeholder="#ops alerts" className={FIELD} />
        </div>
        <fieldset>
          <legend className="text-sm font-medium text-ink">Send these alerts</legend>
          <div className="mt-2 grid gap-1.5 sm:grid-cols-2">
            {events.map((ev) => (
              <label key={ev} className="flex items-center gap-2 text-sm text-ink">
                <input type="checkbox" checked={chosen.includes(ev)} onChange={() => toggle(ev)} className="h-4 w-4 accent-[hsl(var(--accent))]" />
                {EVENT_LABEL[ev]}
              </label>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend className="text-sm font-medium text-ink">For</legend>
          <div className="mt-2 flex gap-4 text-sm text-ink">
            <label className="flex items-center gap-2">
              <input type="radio" name="scope" checked={allSites} onChange={() => setAllSites(true)} className="accent-[hsl(var(--accent))]" /> All sites
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" name="scope" checked={!allSites} onChange={() => setAllSites(false)} className="accent-[hsl(var(--accent))]" /> Only some sites
            </label>
          </div>
          {!allSites && (
            <div className="mt-2">
              <SitePicker sites={sites} value={siteIds} onChange={setSiteIds} idPrefix="ch-site" />
            </div>
          )}
        </fieldset>
        {error && <p className={ERROR} role="alert">{error}</p>}
        <div className="flex flex-wrap gap-3">
          <button type="submit" disabled={busy} className={BTN_PRIMARY}>
            {busy ? "Saving…" : initial ? "Save changes" : "Connect"}
          </button>
          <button type="button" disabled={busy} onClick={onClose} className={BTN_SECONDARY}>
            Cancel
          </button>
        </div>
      </form>
    </Dialog>
  );
}
