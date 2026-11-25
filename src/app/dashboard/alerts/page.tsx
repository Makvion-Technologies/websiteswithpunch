import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getEffectivePlan } from "@/lib/plans";
import { HEARTBEATS } from "@/lib/heartbeats/config";
import { CHANNEL_LIMIT } from "@/lib/features/limits";
import { toClientChannel } from "@/lib/channels/client";
import { AlertPrefs } from "@/components/alerts/AlertPrefs";
import { PageHeader } from "@/components/dash/ui";
import { ChannelsManager } from "@/components/dash/alerts/ChannelsManager";

export const dynamic = "force-dynamic";

export default async function AlertsPage() {
  const session = await getSession();
  if (!session?.user?.id) redirect("/login");
  const [user, channels, sites] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.user.id }, select: { email: true, plan: true, dodoStatus: true, alertDown: true, alertSsl: true, alertDomain: true } }),
    prisma.alertChannel.findMany({ where: { userId: session.user.id }, orderBy: { createdAt: "asc" } }),
    prisma.site.findMany({ where: { userId: session.user.id }, select: { id: true, name: true, url: true }, orderBy: { createdAt: "asc" } }),
  ]);
  if (!user) redirect("/login");
  const plan = getEffectivePlan(user.plan, user.dodoStatus);
  return (
    <div className="space-y-6">
      <PageHeader
        title="Alerts & integrations"
        description="Alerts are emailed to you. Add Slack, Discord, Telegram or a webhook, and choose which alerts each one gets."
      />
      <ChannelsManager channels={channels.map(toClientChannel)} sites={sites} limit={CHANNEL_LIMIT[plan]} cron={HEARTBEATS} />
      <AlertPrefs email={user.email} initial={{ alertDown: user.alertDown, alertSsl: user.alertSsl, alertDomain: user.alertDomain }} />
    </div>
  );
}
