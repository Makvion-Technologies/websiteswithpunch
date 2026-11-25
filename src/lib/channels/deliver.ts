import { open } from "./secret-box";
import { payloadFor, signBody } from "./format";
import { postJson, type PostResult } from "./post";
import type { AlertMessage, ChannelKind } from "./types";

type Row = { kind: string; config: string };
type Cfg = { url?: string; botToken?: string; chatId?: string; signingSecret?: string };

/** Sends one message to one channel row. Never throws. */
export async function deliver(row: Row, m: AlertMessage): Promise<PostResult> {
  const cfg = open<Cfg>(row.config);
  if (!cfg) return { ok: false, error: "Saved settings can't be read. Edit the channel and save it again." };
  const kind = row.kind as ChannelKind;
  if (kind === "telegram") {
    if (!cfg.botToken || !cfg.chatId) return { ok: false, error: "Missing bot token or chat ID." };
    const body = JSON.stringify(payloadFor(kind, m, cfg.chatId));
    const r = await postJson(`https://api.telegram.org/bot${cfg.botToken}/sendMessage`, body);
    // Never echo the URL (it holds the bot token) back into an error message.
    return r.ok ? r : { ok: false, error: r.error.replace(/bot\d+:[A-Za-z0-9_-]+/g, "bot…") };
  }
  if (!cfg.url) return { ok: false, error: "Missing URL." };
  const body = JSON.stringify(payloadFor(kind, m));
  const headers: Record<string, string> = {};
  if (kind === "webhook" && cfg.signingSecret) {
    const ts = String(Math.floor(Date.now() / 1000));
    headers["X-WWP-Timestamp"] = ts;
    headers["X-WWP-Signature"] = signBody(cfg.signingSecret, ts, body);
    headers["X-WWP-Event"] = m.event;
  }
  return postJson(cfg.url, body, headers);
}
