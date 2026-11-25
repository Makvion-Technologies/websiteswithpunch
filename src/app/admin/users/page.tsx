import { clock } from "@/lib/activity/status";
import { redirect } from "next/navigation";
import { viewSection } from "@/lib/admin/seen";
import { SeenRefresh } from "@/components/admin/SeenRefresh";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/guard";
import { USER_ROW_SELECT, USER_SORTS, parseUserQuery, userListWhere, userOrder } from "@/lib/admin/users-query";
import { AdminHeader, Filters, PAGE_SIZE, Pager, Panel, pageOf } from "@/components/admin/ui";
import { UsersList } from "@/components/admin/UsersList";

export const metadata = { title: "Users" };
type Search = { q?: string; plan?: string; act?: string; sort?: string; country?: string; page?: string; u?: string };

export default async function AdminUsers(props: { searchParams: Promise<Search> }) {
  const sp = await props.searchParams;
  // Old drawer links (?u=ID) now open the full user page.
  if (sp.u) redirect(`/admin/users/${encodeURIComponent(sp.u.slice(0, 40))}`);
  const admin = await requireAdmin();
  const o = parseUserQuery(sp);
  const page = pageOf(sp.page);
  const now = clock();
  const where = userListWhere(o, now);
  const [total, users] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({ where, orderBy: userOrder(o.sort), skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE, select: USER_ROW_SELECT }),
  ]);
  const seen = await viewSection(admin.email!, ["users", "users:paid", "users:free", "users:pro", "users:business"], [o.plan ? `users:${o.plan}` : "users"]);
  const isNew = (d: Date) => d > seen.since;
  const base = { q: o.q, plan: o.plan, act: o.act, sort: o.sort === "joined" ? undefined : o.sort, country: o.country };

  return (
    <div className="space-y-4">
      <SeenRefresh on={seen.refresh} />
      <AdminHeader title="Users" sub="Read-only. Location and activity come from sign-in and new dashboard sessions." />
      <form action="/admin/users" className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        {o.plan && <input type="hidden" name="plan" value={o.plan} />}
        {o.act && <input type="hidden" name="act" value={o.act} />}
        <label htmlFor="user-q" className="sr-only">Search users</label>
        <input id="user-q" name="q" defaultValue={o.q} placeholder="Search email, name, city or source" className="min-w-0 flex-1 border border-rule bg-bg px-3 py-2 text-sm text-ink placeholder:text-muted/70 focus:border-accent focus:outline-none sm:max-w-sm" />
        <label htmlFor="user-country" className="sr-only">Country code</label>
        <input id="user-country" name="country" defaultValue={o.country} placeholder="Country (IN)" maxLength={2} className="w-full border border-rule bg-bg px-3 py-2 text-sm uppercase text-ink placeholder:normal-case placeholder:text-muted/70 focus:border-accent focus:outline-none sm:w-32" />
        <label htmlFor="user-sort" className="sr-only">Sort by</label>
        <select id="user-sort" name="sort" defaultValue={o.sort} className="border border-rule bg-bg px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none">
          {Object.entries(USER_SORTS).map(([v, l]) => <option key={v} value={v}>Sort: {l}</option>)}
        </select>
        <button className="border border-rule px-3 py-2 text-sm font-medium text-ink hover:border-accent hover:text-accent">Apply</button>
      </form>
      <div className="flex flex-col gap-2 xl:flex-row xl:items-center xl:justify-between">
        <Filters path="/admin/users" q={base} name="plan" badges={{ "": seen.counts.users, paid: seen.counts["users:paid"], free: seen.counts["users:free"], pro: seen.counts["users:pro"], business: seen.counts["users:business"] }} options={[["", "All plans"], ["paid", "Paying"], ["free", "Free"], ["pro", "Pro"], ["business", "Business"]]} />
        <Filters path="/admin/users" q={base} name="act" options={[["", "Any activity"], ["today", "Active today"], ["week", "This week"], ["month", "This month"], ["dormant", "Dormant 30d+"]]} />
      </div>
      <Panel>
        <UsersList users={users} isNew={isNew} now={now} />
        <Pager path="/admin/users" q={base} page={page} total={total} />
      </Panel>
    </div>
  );
}
