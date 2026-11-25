export const CHANNEL_KINDS = ["slack", "discord", "telegram", "webhook"] as const;
export type ChannelKind = (typeof CHANNEL_KINDS)[number];

export const CHANNEL_EVENTS = ["down", "recovered", "ssl", "domain", "heartbeat"] as const;
export type ChannelEvent = (typeof CHANNEL_EVENTS)[number];

export const EVENT_LABEL: Record<ChannelEvent, string> = {
  down: "Site down",
  recovered: "Site back up",
  ssl: "SSL expiry",
  domain: "Domain expiry",
  heartbeat: "Cron job missed / resumed",
};

export const KIND_LABEL: Record<ChannelKind, string> = {
  slack: "Slack",
  discord: "Discord",
  telegram: "Telegram",
  webhook: "Webhook",
};

/** Decrypted channel settings. */
export type ChannelConfig =
  | { url: string }
  | { botToken: string; chatId: string }
  | { url: string; signingSecret: string };

/** One alert, already worded, ready for any channel. */
export type AlertMessage = {
  event: ChannelEvent;
  /** "down" | "up" | "warn" drives the colour/emoji. */
  tone: "down" | "up" | "warn";
  title: string;
  /** Short lines: status code, error, expiry date… */
  lines: string[];
  link: string;
  subject: { type: "site" | "heartbeat"; id: string; name: string; url?: string };
  at: Date;
  test?: boolean;
};

/** Client-safe view of a channel (no secrets). */
export type ClientChannel = {
  id: string;
  kind: ChannelKind;
  name: string;
  hint: string;
  events: ChannelEvent[];
  allSites: boolean;
  siteIds: string[];
  enabled: boolean;
  lastSentAt: string | null;
  lastError: string | null;
};
