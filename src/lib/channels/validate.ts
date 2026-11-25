import { z } from "zod";
import { CHANNEL_EVENTS, CHANNEL_KINDS, type ChannelKind } from "./types";

/**
 * Pure checks for channel targets (unit tested). Slack, Discord and Telegram only ever post to
 * their own official hosts; a generic webhook must be https on 443/8443 with a public hostname
 * (the DNS answer is checked again at send time by the socket's guarded lookup).
 */
const SLACK_RE = /^https:\/\/hooks\.slack\.com\/services\/[A-Za-z0-9]+\/[A-Za-z0-9]+\/[A-Za-z0-9]+$/;
const DISCORD_RE = /^https:\/\/(?:(?:ptb|canary)\.)?discord(?:app)?\.com\/api\/webhooks\/\d{5,25}\/[A-Za-z0-9_-]{20,100}$/;
export const TG_TOKEN_RE = /^\d{5,12}:[A-Za-z0-9_-]{30,50}$/;
const TG_CHAT_RE = /^(?:-?\d{1,20}|@[A-Za-z][A-Za-z0-9_]{4,31})$/;

export type TargetResult = { ok: true; config: Record<string, string>; hint: string } | { ok: false; error: string };

const tail = (s: string, n = 4) => `…${s.slice(-n)}`;

export function webhookUrlProblem(raw: string): string | null {
  let u: URL;
  try {
    u = new URL(raw.trim());
  } catch {
    return "Enter a full URL starting with https://";
  }
  if (u.protocol !== "https:") return "Webhook URLs must use https://";
  if (u.username || u.password) return "Remove the username and password from the URL (use a token in the path or query).";
  if (u.port && u.port !== "443" && u.port !== "8443") return "Use port 443 or 8443.";
  const host = u.hostname.toLowerCase().replace(/^\[|\]$/g, "");
  if (!host.includes(".") || /^[\d.]+$/.test(host) || host.includes(":")) return "Use a public hostname, not an IP address.";
  if (/(^|\.)(localhost|local|internal|lan|home|corp|intranet)$/.test(host)) return "That host isn't reachable from the internet.";
  if (raw.length > 500) return "That URL is too long.";
  return null;
}

export function checkTarget(kind: ChannelKind, input: Record<string, unknown>): TargetResult {
  const s = (k: string) => (typeof input[k] === "string" ? (input[k] as string).trim() : "");
  if (kind === "slack") {
    const url = s("url");
    if (!SLACK_RE.test(url)) return { ok: false, error: "Paste a Slack incoming webhook URL (https://hooks.slack.com/services/…)." };
    return { ok: true, config: { url }, hint: `hooks.slack.com ${tail(url)}` };
  }
  if (kind === "discord") {
    const url = s("url");
    if (!DISCORD_RE.test(url)) return { ok: false, error: "Paste a Discord webhook URL (https://discord.com/api/webhooks/…)." };
    return { ok: true, config: { url }, hint: `discord.com ${tail(url)}` };
  }
  if (kind === "telegram") {
    const botToken = s("botToken");
    const chatId = s("chatId");
    if (!TG_TOKEN_RE.test(botToken)) return { ok: false, error: "Paste the bot token from @BotFather (it looks like 123456789:AA…)." };
    if (!TG_CHAT_RE.test(chatId)) return { ok: false, error: "Enter a chat ID (a number like 123456789 or -100…) or @channelname." };
    return { ok: true, config: { botToken, chatId }, hint: `chat ${chatId}` };
  }
  const url = s("url");
  const problem = webhookUrlProblem(url);
  if (problem) return { ok: false, error: problem };
  const host = new URL(url).hostname;
  return { ok: true, config: { url }, hint: host };
}

export const channelBody = z.object({
  kind: z.enum(CHANNEL_KINDS),
  name: z.string().trim().min(1).max(60),
  target: z.record(z.string(), z.string().max(600)).optional(),
  events: z.array(z.enum(CHANNEL_EVENTS)).min(1).max(CHANNEL_EVENTS.length),
  allSites: z.boolean(),
  siteIds: z.array(z.string().max(40)).max(500).default([]),
  enabled: z.boolean().default(true),
});

export const channelPatch = channelBody.omit({ kind: true }).partial();
