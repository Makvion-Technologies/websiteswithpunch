import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ago, clock } from "@/lib/activity/status";
import { Badge, Panel, fmtDate } from "./ui";

type Signup = { id: string; email: string; plan: string; createdAt: Date };
type Audit = { id: string; action: string; createdAt: Date };

/** Recent sign-ups, recently active users and admin actions, side by side on wide screens. */
export async function RecentUsers({ signups, activity }: { signups: Signup[]; activity: Audit[] }) {
  const active = await prisma.user.findMany({
    where: { lastActiveAt: { not: null } }, orderBy: { lastActiveAt: "desc" }, take: 8,
    select: { id: true, email: true, lastActiveAt: true, lastCity: true, lastCountry: true },
  });
  const now = clock();
  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-2 xl:grid-cols-3">
      <Panel title="Recent sign-ups" action={<Link href="/admin/users" className="text-xs text-accent hover:underline">All users</Link>}>
        {signups.length === 0 ? <p className="px-4 py-6 text-sm text-muted">No users yet.</p> : (
          <ul className="divide-y divide-rule">
            {signups.map((u) => (
              <li key={u.id}>
                <Link href={`/admin/users/${u.id}`} className="flex items-center gap-3 px-4 py-2.5 hover:bg-accent-soft">
                  <span className="min-w-0 flex-1 truncate text-sm text-ink">{u.email}</span>
                  <Badge tone={u.plan === "free" ? "muted" : "accent"}>{u.plan}</Badge>
                  <span className="hidden shrink-0 text-xs text-muted sm:inline">{fmtDate(u.createdAt, false)}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Panel>
      <Panel title="Recently active" action={<Link href="/admin/users?sort=active" className="text-xs text-accent hover:underline">By last active</Link>}>
        {active.length === 0 ? <p className="px-4 py-6 text-sm text-muted">No sessions recorded yet.</p> : (
          <ul className="divide-y divide-rule">
            {active.map((u) => (
              <li key={u.id}>
                <Link href={`/admin/users/${u.id}`} className="flex items-center gap-3 px-4 py-2.5 hover:bg-accent-soft">
                  <span className="min-w-0 flex-1 truncate text-sm text-ink">{u.email}</span>
                  <span className="hidden max-w-[10rem] truncate text-xs text-muted sm:inline">{[u.lastCity, u.lastCountry].filter(Boolean).join(", ")}</span>
                  <span className="shrink-0 text-xs tabular-nums text-muted">{ago(u.lastActiveAt, now)}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Panel>
      <Panel title="Admin actions" action={<Link href="/admin/audit" className="text-xs text-accent hover:underline">Audit log</Link>}>
        {activity.length === 0 ? <p className="px-4 py-6 text-sm text-muted">No audited actions yet.</p> : (
          <ul className="divide-y divide-rule">
            {activity.map((a) => (
              <li key={a.id} className="flex items-center gap-3 px-4 py-2.5">
                <span className="min-w-0 flex-1 truncate font-mono text-xs text-ink">{a.action}</span>
                <span className="shrink-0 text-xs text-muted">{fmtDate(a.createdAt)}</span>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}
