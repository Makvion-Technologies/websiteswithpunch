import { clock } from "@/lib/activity/status";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin/guard";
import { loadUserDetail } from "@/lib/admin/user-detail";
import { ActivityDot } from "@/components/admin/ActivityDot";
import { Badge } from "@/components/admin/ui";
import { BillingPanel, ProfilePanel } from "@/components/admin/user/Profile";
import { SitesPanel } from "@/components/admin/user/Sites";
import { IntegrationsPanel } from "@/components/admin/user/Integrations";
import { TimelinePanel } from "@/components/admin/user/Timeline";
import { MoneyPanel } from "@/components/admin/user/Money";

export const metadata = { title: "User", robots: { index: false, follow: false } };

export default async function AdminUser(props: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await props.params;
  const d = await loadUserDetail(id);
  if (!d) notFound();
  const u = d.user;
  const now = clock();
  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/users" className="text-xs text-muted hover:text-accent">← Users</Link>
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
          <h1 className="min-w-0 break-all font-display text-2xl font-medium text-ink">{u.email}</h1>
          <Badge tone={u.plan === "free" ? "muted" : "accent"}>{u.plan}</Badge>
        </div>
        <p className="mt-1 flex flex-wrap gap-x-3 text-sm text-muted">
          {u.name && <span>{u.name}</span>}
          <span>Last active <ActivityDot at={u.lastActiveAt} now={now} /></span>
          <span>{d.sites.length} site{d.sites.length === 1 ? "" : "s"}</span>
        </p>
      </div>
      <div className="grid grid-cols-[minmax(0,1fr)] gap-6 xl:grid-cols-2 2xl:grid-cols-3">
        <div className="space-y-6">
          <ProfilePanel u={u} now={now} />
          <BillingPanel u={u} />
        </div>
        <div className="space-y-6">
          <SitesPanel sites={d.sites} now={now} />
          <IntegrationsPanel d={d} now={now} />
        </div>
        <div className="space-y-6 xl:col-span-2 2xl:col-span-1">
          <TimelinePanel d={d} />
          <MoneyPanel d={d} />
        </div>
      </div>
    </div>
  );
}
