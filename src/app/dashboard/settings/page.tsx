import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getEffectivePlan, PLANS } from "@/lib/plans";
import { ratePercent } from "@/lib/referrals/config";
import { ProfileForm } from "@/components/ProfileForm";
import { PageHeader, Panel } from "@/components/dash/ui";

export const dynamic = "force-dynamic";

const ROW = "flex items-center justify-between gap-4 border-b border-rule px-4 py-3 last:border-b-0 hover:bg-bg";

/** Account settings, grouped: profile here; plan, billing and referrals one click away. */
export default async function SettingsPage() {
  const session = await getSession();
  if (!session?.user?.id) redirect("/login");
  const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { name: true, email: true, plan: true, dodoStatus: true, cancelAtPeriodEnd: true } });
  if (!user) redirect("/login");
  const plan = getEffectivePlan(user.plan, user.dodoStatus);
  const links = [
    { href: "/plan", title: "Plan and billing", text: `${PLANS[plan].name} plan${user.cancelAtPeriodEnd ? " · cancels at period end" : ""}. Change plan, invoices and payment method.` },
    { href: "/dashboard/alerts", title: "Alert emails", text: "Turn down, SSL and domain emails on or off." },
    { href: "/dashboard/reports", title: "Weekly report", text: "One summary email a week." },
    { href: "/referrals", title: "Referral program", text: `Earn ${ratePercent}% when people you refer pay for a plan.` },
  ];
  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Your profile, plan and account preferences." />
      <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-2">
        <ProfileForm initialName={user.name || ""} email={user.email} />
        <Panel title="Account">
          <ul>
            {links.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className={ROW}>
                  <span className="min-w-0">
                    <span className="block text-sm font-medium text-ink">{l.title}</span>
                    <span className="block text-xs text-muted">{l.text}</span>
                  </span>
                  <span className="shrink-0 text-muted" aria-hidden>→</span>
                </Link>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </div>
  );
}
