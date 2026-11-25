import { prisma } from "@/lib/prisma";
import { isVerified } from "@/lib/email-verify";
import { sendEmail } from "@/lib/email/send";
import { unsubscribeHeaders, unsubscribeLinks } from "@/lib/alerts/unsubscribe";
import { buildWeeklyReport } from "./build";
import { reportEmail } from "./email";
import { reportDue } from "./schedule";

/**
 * Resend's free plan allows 100 emails a day, shared with alerts. Reports are spread over the
 * week (one weekday bucket per user) and capped per run, leaving most of the day for alerts.
 */
export const REPORTS_PER_DAY = 40;

export async function sendOneReport(user: { id: string; email: string }, now = Date.now()) {
  const report = await buildWeeklyReport(user.id, now);
  const mail = reportEmail(report, unsubscribeLinks(user.id, "report"));
  return sendEmail({ to: user.email, ...mail, headers: unsubscribeHeaders(user.id, "report"), tag: "report" });
}

export async function sendDueReports(budgetMs = 40_000, now = Date.now()) {
  const started = Date.now();
  const users = await prisma.user.findMany({
    where: { weeklyReport: true, sites: { some: { locked: false } } },
    select: { id: true, email: true, emailVerified: true, createdAt: true, weeklyReportSentAt: true },
    orderBy: { weeklyReportSentAt: { sort: "asc", nulls: "first" } },
    take: 2000,
  });
  const due = users.filter((u) => isVerified(u) && reportDue(u.id, u.weeklyReportSentAt, now)).slice(0, REPORTS_PER_DAY);
  const out = { due: due.length, sent: 0, failed: 0 };
  for (const u of due) {
    if (Date.now() - started > budgetMs) break;
    // Claim first, so an overlapping run can't send the same report twice.
    const claimed = await prisma.user.updateMany({
      where: { id: u.id, weeklyReportSentAt: u.weeklyReportSentAt },
      data: { weeklyReportSentAt: new Date(now) },
    });
    if (!claimed.count) continue;
    try {
      const r = await sendOneReport(u, now);
      if (r.sent) out.sent += 1;
      else {
        out.failed += 1;
        await prisma.user.update({ where: { id: u.id }, data: { weeklyReportSentAt: u.weeklyReportSentAt } });
      }
    } catch (err) {
      out.failed += 1;
      console.error("[reports] failed", u.id, err);
    }
  }
  return out;
}
