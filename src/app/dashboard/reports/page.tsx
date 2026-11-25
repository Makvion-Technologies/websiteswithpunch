import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buildWeeklyReport } from "@/lib/reports/build";
import { nextReportDate } from "@/lib/reports/schedule";
import { PageHeader } from "@/components/dash/ui";
import { ReportControls } from "@/components/dash/reports/ReportControls";
import { ReportPreview } from "@/components/dash/reports/ReportPreview";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const session = await getSession();
  if (!session?.user?.id) redirect("/login");
  const [user, report] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.user.id }, select: { id: true, email: true, weeklyReport: true, weeklyReportSentAt: true } }),
    buildWeeklyReport(session.user.id),
  ]);
  if (!user) redirect("/login");
  const next = nextReportDate(user.id, user.weeklyReportSentAt).toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "short", timeZone: "UTC" });
  return (
    <div className="space-y-6">
      <PageHeader title="Weekly report" description="Uptime, incidents, response times and upcoming SSL and domain expiries for every site, in one email a week." />
      <div className="grid grid-cols-[minmax(0,1fr)] gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <div>
          <ReportControls initial={user.weeklyReport} email={user.email} nextLabel={next} />
        </div>
        <ReportPreview r={report} />
      </div>
    </div>
  );
}
