"use client";

import { useState } from "react";
import { CHANNEL_KINDS, KIND_LABEL, type ChannelKind, type ClientChannel } from "@/lib/channels/types";
import type { PickSite } from "@/components/dash/SitePicker";
import { Panel } from "@/components/dash/ui";
import { ChannelForm } from "./ChannelForm";
import { ChannelRow } from "./ChannelRow";
import { KindMark } from "./KindMark";

const BLURB: Record<ChannelKind, string> = {
  slack: "Post to a channel",
  discord: "Post to a server channel",
  telegram: "Message you or a group",
  webhook: "Signed JSON to your URL",
};

type Open = { kind: ChannelKind; channel?: ClientChannel } | null;

/** Chat and webhook channels: list, add (pick a type), edit, test. */
export function ChannelsManager({ channels, sites, limit, cron }: { channels: ClientChannel[]; sites: PickSite[]; limit: number; cron: boolean }) {
  const [open, setOpen] = useState<Open>(null);
  const full = channels.length >= limit;
  return (
    <Panel title={`Chat and webhooks · ${channels.length}/${limit}`}>
      {channels.length > 0 && (
        <ul>
          {channels.map((c) => (
            <ChannelRow key={c.id} c={c} siteCount={sites.length} onEdit={() => setOpen({ kind: c.kind, channel: c })} />
          ))}
        </ul>
      )}
      <div className={channels.length ? "border-t border-rule p-4" : "p-4"}>
        <p className="mb-3 text-sm text-muted">
          {full ? "You've used every channel on your plan. Remove one to add another." : channels.length ? "Add another channel" : "Get alerts where your team already talks. Pick one to connect:"}
        </p>
        {!full && (
          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
            {CHANNEL_KINDS.map((k) => (
              <button key={k} type="button" onClick={() => setOpen({ kind: k })} className="flex items-start gap-3 border border-rule bg-bg p-3 text-left transition-colors hover:border-accent">
                <KindMark kind={k} size="h-8 w-8" />
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-ink">{KIND_LABEL[k]}</span>
                  <span className="block text-xs leading-snug text-muted">{BLURB[k]}</span>
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
      {open && <ChannelForm key={open.channel?.id ?? open.kind} kind={open.kind} initial={open.channel} sites={sites} cron={cron} onClose={() => setOpen(null)} />}
    </Panel>
  );
}
