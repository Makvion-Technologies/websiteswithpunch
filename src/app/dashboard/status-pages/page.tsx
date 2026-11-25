import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getEffectivePlan } from "@/lib/plans";
import { SITE_URL } from "@/lib/site-config";
import { STATUS_PAGE_LIMIT } from "@/lib/features/limits";
import { PageHeader } from "@/components/dash/ui";
import { StatusPagesManager } from "@/components/dash/status/StatusPagesManager";

export const dynamic = "force-dynamic";

export default async function StatusPagesPage() {
  const session = await getSession();
  if (!session?.user?.id) redirect("/login");
  const [user, pages, sites] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.user.id }, select: { plan: true, dodoStatus: true } }),
    prisma.statusPage.findMany({ where: { userId: session.user.id }, orderBy: { createdAt: "asc" }, select: { id: true, title: true, slug: true, description: true, siteIds: true, published: true } }),
    prisma.site.findMany({ where: { userId: session.user.id, locked: false }, select: { id: true, name: true, url: true }, orderBy: { createdAt: "asc" } }),
  ]);
  if (!user) redirect("/login");
  const plan = getEffectivePlan(user.plan, user.dodoStatus);
  return (
    <div>
      <PageHeader title="Status pages" description="Public pages with live status and 90-day uptime bars, in light and dark mode. Pages refresh every minute." />
      <StatusPagesManager pages={pages} sites={sites} limit={STATUS_PAGE_LIMIT[plan]} origin={SITE_URL} />
    </div>
  );
}
