import Link from "next/link";
import { countryName } from "@/lib/activity/geo";
import { ago } from "@/lib/activity/status";
import type { UserRow } from "@/lib/admin/users-query";
import { ActivityDot } from "./ActivityDot";
import { Badge, NewDot, fmtDate } from "./ui";

const place = (u: UserRow) => [u.lastCity, countryName(u.lastCountry)].filter(Boolean).join(", ") || "—";
const PlanBadge = ({ u }: { u: UserRow }) => (
  <Badge tone={u.plan === "free" ? "muted" : u.dodoStatus === "past_due" || u.dodoStatus === "on_hold" ? "danger" : "accent"}>
    {u.plan}{u.cancelAtPeriodEnd ? " · cancelling" : ""}
  </Badge>
);
const th = "whitespace-nowrap px-4 py-2.5 text-xs font-medium text-muted";
const td = "whitespace-nowrap px-4 py-2.5 text-ink";

/** Table on md+, stacked cards on phones (no sideways scrolling at 360px). */
export function UsersList({ users, isNew, now }: { users: UserRow[]; isNew: (d: Date) => boolean; now: number }) {
  if (users.length === 0) return <p className="px-4 py-10 text-center text-sm text-muted">No users match these filters.</p>;
  return (
    <>
      <ul className="divide-y divide-rule md:hidden">
        {users.map((u) => (
          <li key={u.id}>
            <Link href={`/admin/users/${u.id}`} className="block px-4 py-3 hover:bg-accent-soft">
              <div className="flex items-center gap-2">
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-ink"><NewDot on={isNew(u.createdAt)} />{u.email}</span>
                <PlanBadge u={u} />
              </div>
              <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted">
                <ActivityDot at={u.lastActiveAt} now={now} />
                <span>{place(u)}</span>
                <span>{u._count.sites} site{u._count.sites === 1 ? "" : "s"}</span>
                <span>Joined {fmtDate(u.createdAt, false)}</span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-rule">
              {["User", "Plan", "Sites", "Location", "Last active", "Last login", "Joined", "Source", "Device"].map((h, i) => (
                <th key={h} className={`${th} ${i >= 7 ? "hidden 2xl:table-cell" : i >= 5 ? "hidden xl:table-cell" : ""}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-rule">
            {users.map((u) => (
              <tr key={u.id} className={`hover:bg-accent-soft ${isNew(u.createdAt) ? "bg-emerald-50/60 dark:bg-emerald-500/5" : ""}`}>
                <td className={`${td} max-w-[280px]`}>
                  <Link href={`/admin/users/${u.id}`} className="block truncate font-medium hover:text-accent"><NewDot on={isNew(u.createdAt)} />{u.email}</Link>
                  {u.name && <span className="block truncate text-xs text-muted">{u.name}</span>}
                </td>
                <td className={td}><PlanBadge u={u} /></td>
                <td className={`${td} tabular-nums`}>{u._count.sites}</td>
                <td className={`${td} max-w-[200px] truncate text-muted`}>{place(u)}</td>
                <td className={`${td} text-muted`}><ActivityDot at={u.lastActiveAt} now={now} /></td>
                <td className={`${td} hidden text-muted xl:table-cell`}>{u.lastLoginAt ? ago(u.lastLoginAt, now) : "—"}</td>
                <td className={`${td} hidden text-muted xl:table-cell`}>{fmtDate(u.createdAt, false)}</td>
                <td className={`${td} hidden max-w-[160px] truncate text-muted 2xl:table-cell`}>{u.signupSource ?? "—"}</td>
                <td className={`${td} hidden text-muted 2xl:table-cell`}>{u.lastDevice ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
