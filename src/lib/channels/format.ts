import { createHmac } from "node:crypto";
import type { AlertMessage, ChannelKind } from "./types";

/** Pure payload builders for each channel (unit tested). */
const EMOJI = { down: "🔴", up: "🟢", warn: "🟠" } as const;
const COLOR = { down: 0xd92d20, up: 0x12b76a, warn: 0xf79009 } as const;

const head = (m: AlertMessage) => `${m.test ? "[Test] " : ""}${EMOJI[m.tone]} ${m.title}`;

export function slackPayload(m: AlertMessage) {
  const text = [head(m), ...m.lines, m.link].join("\n");
  return {
    text,
    blocks: [
      { type: "section", text: { type: "mrkdwn", text: `*${head(m)}*\n${m.lines.join("\n")}` } },
      { type: "context", elements: [{ type: "mrkdwn", text: `<${m.link}|Open in Websites With Punch>` }] },
    ],
  };
}

export function discordPayload(m: AlertMessage) {
  return {
    username: "Websites With Punch",
    embeds: [
      {
        title: head(m).slice(0, 250),
        description: m.lines.join("\n").slice(0, 3500),
        url: m.link,
        color: COLOR[m.tone],
        timestamp: m.at.toISOString(),
        footer: { text: "Websites With Punch" },
      },
    ],
  };
}

/** Telegram HTML: escape &, <, > and " (needed inside <a href>). */
const escTg = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export function telegramPayload(m: AlertMessage, chatId: string) {
  return {
    chat_id: chatId,
    parse_mode: "HTML",
    disable_web_page_preview: true,
    text: [`<b>${escTg(head(m))}</b>`, ...m.lines.map(escTg), `<a href="${escTg(m.link)}">Open in Websites With Punch</a>`].join("\n"),
  };
}

export function webhookPayload(m: AlertMessage) {
  return {
    event: m.event,
    status: m.tone,
    test: Boolean(m.test),
    title: m.title,
    details: m.lines,
    url: m.link,
    subject: m.subject,
    occurredAt: m.at.toISOString(),
  };
}

/** Header value: v1=<hex HMAC-SHA256 of "<timestamp>.<body>"> with the channel's signing secret. */
export function signBody(secret: string, timestamp: string, body: string): string {
  return `v1=${createHmac("sha256", secret).update(`${timestamp}.${body}`).digest("hex")}`;
}

export function payloadFor(kind: ChannelKind, m: AlertMessage, chatId = ""): unknown {
  if (kind === "slack") return slackPayload(m);
  if (kind === "discord") return discordPayload(m);
  if (kind === "telegram") return telegramPayload(m, chatId);
  return webhookPayload(m);
}
