"use client";

import { useState } from "react";
import type { ChannelKind } from "@/lib/channels/types";
import { FIELD } from "@/components/dash/ui";

type Props = { kind: ChannelKind; value: Record<string, string>; onChange: (v: Record<string, string>) => void; editing: boolean };

const HELP: Record<ChannelKind, string[]> = {
  slack: ["In Slack, open Apps and add Incoming WebHooks (or create an app at api.slack.com/apps).", "Pick the channel, then copy the Webhook URL and paste it here."],
  discord: ["Open the channel's settings, then Integrations → Webhooks → New Webhook.", "Click Copy Webhook URL and paste it here."],
  telegram: ["Message @BotFather, send /newbot and copy the token it gives you.", "Send any message to your new bot (or add it to a group), then click Find my chat."],
  webhook: ["We POST JSON to this HTTPS URL for each alert.", "Every request is signed (X-WWP-Signature, HMAC-SHA256) so you can check it came from us."],
};

/** The kind-specific inputs, with the 2-step "where do I find this" help beside them. */
export function TargetFields({ kind, value, onChange, editing }: Props) {
  const [finding, setFinding] = useState(false);
  const [chats, setChats] = useState<Array<{ id: string; name: string }> | null>(null);
  const [findError, setFindError] = useState<string | null>(null);
  const set = (k: string, v: string) => onChange({ ...value, [k]: v });
  const keep = editing ? " Leave blank to keep the saved one." : "";

  async function findChat() {
    setFinding(true);
    setFindError(null);
    try {
      const res = await fetch("/api/channels/telegram-chats", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ botToken: value.botToken ?? "" }) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) return setFindError(data.error || "Couldn't reach Telegram.");
      setChats(data.chats);
      if (data.chats.length === 1) set("chatId", data.chats[0].id);
      if (!data.chats.length) setFindError("No messages yet. Send your bot a message, then try again.");
    } catch {
      setFindError("Network error");
    } finally {
      setFinding(false);
    }
  }

  return (
    <div className="space-y-3">
      <ol className="list-decimal space-y-1 border-l-2 border-accent/40 bg-accent-soft py-2 pl-8 pr-3 text-xs text-ink">
        {HELP[kind].map((h) => (
          <li key={h}>{h}</li>
        ))}
      </ol>
      {kind === "telegram" ? (
        <>
          <div>
            <label htmlFor="ch-token" className="block text-sm font-medium text-ink">Bot token</label>
            <input id="ch-token" value={value.botToken ?? ""} onChange={(e) => set("botToken", e.target.value)} placeholder="123456789:AAH…" autoComplete="off" spellCheck={false} className={`${FIELD} font-mono`} />
            {keep && <p className="mt-1 text-xs text-muted">{keep.trim()}</p>}
          </div>
          <div>
            <label htmlFor="ch-chat" className="block text-sm font-medium text-ink">Chat ID</label>
            <div className="mt-1 flex gap-2">
              <input id="ch-chat" value={value.chatId ?? ""} onChange={(e) => set("chatId", e.target.value)} placeholder="123456789 or @yourchannel" className={`${FIELD} mt-0 font-mono`} />
              <button type="button" onClick={findChat} disabled={finding || !value.botToken} className="shrink-0 border border-rule px-3 text-sm font-medium text-ink hover:border-accent hover:text-accent disabled:opacity-50">
                {finding ? "Looking…" : "Find my chat"}
              </button>
            </div>
            {chats && chats.length > 1 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {chats.map((c) => (
                  <button key={c.id} type="button" onClick={() => set("chatId", c.id)} className={`border px-2 py-1 text-xs ${value.chatId === c.id ? "border-accent text-accent" : "border-rule text-ink"}`}>
                    {c.name}
                  </button>
                ))}
              </div>
            )}
            {findError && <p className="mt-1 text-xs text-danger">{findError}</p>}
          </div>
        </>
      ) : (
        <div>
          <label htmlFor="ch-url" className="block text-sm font-medium text-ink">{kind === "webhook" ? "Endpoint URL" : "Webhook URL"}</label>
          <input
            id="ch-url"
            value={value.url ?? ""}
            onChange={(e) => set("url", e.target.value)}
            placeholder={kind === "slack" ? "https://hooks.slack.com/services/T000/B000/XXXX" : kind === "discord" ? "https://discord.com/api/webhooks/123…/abc…" : "https://example.com/hooks/uptime"}
            autoComplete="off"
            spellCheck={false}
            className={`${FIELD} font-mono`}
          />
          {keep && <p className="mt-1 text-xs text-muted">{keep.trim()}</p>}
        </div>
      )}
    </div>
  );
}
