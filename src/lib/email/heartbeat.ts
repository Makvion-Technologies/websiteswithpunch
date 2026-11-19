/** Heartbeat (cron job) alert emails, in the same style as the site alerts. */
import { C, escapeHtml, renderEmail, renderText } from "./layout";
import { banner, duration, facts, fmtTime } from "./alerts";
import type { BuiltEmail } from "./templates";
import { SITE_URL } from "@/lib/site-config";
import { spanText } from "@/lib/heartbeats/config";

export type HbMailInfo = {
  name: string;
  periodSec: number;
  graceSec: number;
  lastPingAt: Date | null;
  at: Date;
  downSince?: Date | null;
};

export function heartbeatEmail(kind: "down" | "up", h: HbMailInfo, links: { page: string }): BuiltEmail {
  const last = h.lastPingAt ? fmtTime(h.lastPingAt) : "Never";
  const down = kind === "down";
  const c = down
    ? {
        tone: "red" as const, label: "Heartbeat missed", subject: `Missed: ${h.name} didn't check in`,
        heading: `${h.name} didn't check in`,
        intro: `We expected a ping every ${spanText(h.periodSec)} (plus ${spanText(h.graceSec)} grace) and none arrived. The job may have failed, hung or stopped running.`,
        rows: [["Heartbeat", h.name], ["Last ping", last], ["Marked missed", fmtTime(h.at)]] as [string, string][],
        tip: "Check the job's logs and the server it runs on. We'll email you once when pings resume.",
      }
    : {
        tone: "green" as const, label: "Heartbeat back", subject: `Back: ${h.name} is checking in again`,
        heading: `${h.name} is checking in again`,
        intro: "A new ping arrived, so the job is running again.",
        rows: [
          ["Heartbeat", h.name], ["Ping received", last],
          ...(h.downSince ? [["Missing for about", duration(h.at.getTime() - h.downSince.getTime())]] : []),
        ] as [string, string][],
        tip: "Missed time is counted from when we marked it missed, so the real gap was a little longer.",
      };
  const url = `${SITE_URL}/dashboard#heartbeats`;
  const prefs = `${SITE_URL}/profile#alerts`;
  const note = "We look for missed pings every minute. Down alerts cover sites and heartbeats.";
  const reason = `You're receiving this because down alerts are on for your account. <a class="wwp-link" href="${escapeHtml(prefs)}" style="color:${C.accent}">Alert settings</a> · <a class="wwp-link" href="${escapeHtml(links.page)}" style="color:${C.accent}">Unsubscribe</a>`;
  return {
    subject: c.subject,
    html: renderEmail({
      title: c.subject,
      preheader: `${c.label}: ${c.intro}`,
      top: banner(c.tone, c.label, h.name),
      heading: c.heading,
      intro: [escapeHtml(c.intro)],
      extra: facts(c.rows),
      button: { label: "Open heartbeats", url },
      notes: [escapeHtml(c.tip), note],
      reason,
    }),
    text: renderText([
      `${c.label.toUpperCase()}: ${c.heading}`,
      c.intro,
      c.rows.map(([k, v]) => `${k}: ${v}`).join("\n"),
      `Open heartbeats: ${url}`,
      c.tip,
      note,
      `Alert settings: ${prefs}\nUnsubscribe: ${links.page}`,
    ]),
  };
}
