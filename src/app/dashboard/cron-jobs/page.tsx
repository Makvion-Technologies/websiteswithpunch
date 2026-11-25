import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getEffectivePlan } from "@/lib/plans";
import { HEARTBEATS } from "@/lib/heartbeats/config";
import { HeartbeatsSection } from "@/components/heartbeats/HeartbeatsSection";

export const dynamic = "force-dynamic";

/** Heartbeat (cron job) monitors. Live only with NEXT_PUBLIC_HEARTBEATS=1 and fast checks on. */
export default async function CronJobsPage() {
  if (!HEARTBEATS) notFound();
  const session = await getSession();
  if (!session?.user?.id) redirect("/login");
  const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { id: true, plan: true, dodoStatus: true } });
  if (!user) redirect("/login");
  return <HeartbeatsSection userId={user.id} plan={getEffectivePlan(user.plan, user.dodoStatus)} />;
}
