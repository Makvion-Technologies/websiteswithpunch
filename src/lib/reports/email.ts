import { C, escapeHtml, renderEmail, renderText } from "@/lib/email/layout";
import { SITE_URL } from "@/lib/site-config";
import type { WeeklyReport } from "./build";

const FONT = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";
const pct = (v: number | null) => (v == null ? "no data" : `${v}%`);
const mins = (ms: number) => (ms < 60_000 ? "0 min" : ms < 3_600_000 ? `${Math.round(ms / 60_000)} min` : `${Math.round(ms / 360_000) / 10} h`);
const td = (h: string, extra = "") =>
  `<td class="wwp-ink wwp-rule" style="padding:8px 6px;border-bottom:1px solid ${C.rule};font-family:${FONT};font-size:13px;line-height:18px;color:${C.ink};${extra}">${h}</td>`;

function table(r: WeeklyReport): string {
  const rows = r.sites
    .slice(0, 25)
    .map((s) => `<tr>${td(escapeHtml(s.name))}${td(pct(s.uptime), "text-align:right")}${td(String(s.incidents), "text-align:right")}${td(s.avgMs == null ? "–" : `${s.avgMs} ms`, "text-align:right")}</tr>`)
    .join("");
  const head = ["Site", "Uptime", "Incidents", "Avg"].map((h, i) => td(`<b>${h}</b>`, i ? "text-align:right" : "")).join("");
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:4px 0 20px;border-collapse:collapse"><tr>${head}</tr>${rows}</table>`;
}

/** Weekly report email (HTML + text). */
export function reportEmail(r: WeeklyReport, links: { page: string }) {
  const summary = `${pct(r.uptime)} uptime across ${r.sites.length} site${r.sites.length === 1 ? "" : "s"}, ${r.incidents} incident${r.incidents === 1 ? "" : "s"}`;
  const exp = r.expiries.map((e) => `${escapeHtml(e.siteName)}: ${e.kind} ${e.daysLeft < 0 ? "expired" : `in ${e.daysLeft} days`} (${e.date})`);
  const intro = [`Here's how your sites did from ${r.from} to ${r.to}: <b>${summary}</b>.`];
  if (r.cronMissed) intro.push(`Cron jobs missed a ping ${r.cronMissed} time${r.cronMissed === 1 ? "" : "s"} this week.`);
  const html = renderEmail({
    title: "Your weekly report",
    preheader: summary,
    heading: "Your weekly report",
    intro,
    extra: table(r) + (exp.length ? `<p class="wwp-ink" style="margin:0 0 8px;font-family:${FONT};font-size:14px;color:${C.ink}"><b>Coming up in the next 30 days</b></p><p class="wwp-ink" style="margin:0 0 20px;font-family:${FONT};font-size:13px;line-height:20px;color:${C.ink}">${exp.join("<br>")}</p>` : ""),
    button: { label: "Open your dashboard", url: `${SITE_URL}/dashboard` },
    reason: `You turned on weekly reports. <a class="wwp-link" href="${escapeHtml(links.page)}" style="color:${C.accent}">Stop weekly reports</a>.`,
  });
  const text = renderText([
    `Your weekly report (${r.from} to ${r.to})`,
    summary,
    r.sites.slice(0, 25).map((s) => `- ${s.name}: ${pct(s.uptime)} uptime, ${s.incidents} incidents, ${mins(s.downMs)} down`).join("\n"),
    ...(exp.length ? [`Coming up:\n${r.expiries.map((e) => `- ${e.siteName}: ${e.kind} ${e.date}`).join("\n")}`] : []),
    `Dashboard: ${SITE_URL}/dashboard`,
    `Stop weekly reports: ${links.page}`,
  ]);
  return { subject: `Weekly report: ${summary}`, html, text };
}
