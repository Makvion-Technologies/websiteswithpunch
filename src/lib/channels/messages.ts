import type { PlannedAlert } from "@/lib/alerts/plan";
import { SITE_URL } from "@/lib/site-config";
import type { AlertMessage } from "./types";

const date = (d: Date) => d.toISOString().slice(0, 10);

function duration(ms: number): string {
  const m = Math.max(1, Math.round(ms / 60000));
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  return h < 48 ? `${h} h ${m % 60} min` : `${Math.round(h / 24)} days`;
}

type SiteLike = { id: string; name: string; url: string; statusCode?: number | null; error?: string | null };

/** Chat/webhook wording for a planned site alert (same events as the email). */
export function siteAlertMessage(a: PlannedAlert, site: SiteLike, at: Date): AlertMessage {
  const link = `${SITE_URL}/dashboard/sites/${site.id}`;
  const subject = { type: "site" as const, id: site.id, name: site.name, url: site.url };
  if (a.kind === "down") {
    const why = site.error || (site.statusCode ? `HTTP ${site.statusCode}` : "No response");
    return { event: "down", tone: "down", title: `${site.name} is down`, lines: [site.url, `Reason: ${why}`, "Confirmed from a second network."], link, subject, at };
  }
  if (a.kind === "recovered") {
    return { event: "recovered", tone: "up", title: `${site.name} is back up`, lines: [site.url, `Down for ${duration(at.getTime() - a.downSince.getTime())}`], link, subject, at };
  }
  const what = a.kind === "ssl" ? "SSL certificate" : "Domain";
  const when =
    a.level === "expired" ? `${what} expired on ${date(a.expiresAt)}` :
    a.level === "invalid" ? `${what} is not trusted by browsers (expires ${date(a.expiresAt)})` :
    `${what} expires in ${a.daysLeft} day${a.daysLeft === 1 ? "" : "s"} (${date(a.expiresAt)})`;
  return { event: a.kind, tone: a.level === "30" ? "warn" : "down", title: `${site.name}: ${when}`, lines: [site.url], link, subject, at };
}

export function heartbeatMessage(kind: "down" | "up", hb: { id: string; name: string; lastPingAt: Date | null }, at: Date): AlertMessage {
  const last = hb.lastPingAt ? `Last ping ${hb.lastPingAt.toISOString().replace("T", " ").slice(0, 16)} UTC` : "No ping received yet";
  return {
    event: "heartbeat",
    tone: kind === "down" ? "down" : "up",
    title: kind === "down" ? `Cron job "${hb.name}" missed its ping` : `Cron job "${hb.name}" is pinging again`,
    lines: [last],
    link: `${SITE_URL}/dashboard/cron-jobs`,
    subject: { type: "heartbeat", id: hb.id, name: hb.name },
    at,
  };
}

export function testMessage(name: string): AlertMessage {
  return {
    event: "down",
    tone: "up",
    title: `Test alert for "${name}"`,
    lines: ["This channel is connected. Real alerts look like this, with the site, the reason and a link."],
    link: `${SITE_URL}/dashboard/alerts`,
    subject: { type: "site", id: "test", name: "example.com", url: "https://example.com" },
    at: new Date(),
    test: true,
  };
}
