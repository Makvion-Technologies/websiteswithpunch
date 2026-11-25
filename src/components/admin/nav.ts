import type { AdminIconName } from "./icons";

export type AdminNavItem = { href: string; label: string; icon: AdminIconName };
export type AdminNavGroup = { label: string; items: AdminNavItem[] };

/** Admin information architecture: same grouped rail as the customer dashboard. */
export const ADMIN_NAV: AdminNavGroup[] = [
  {
    label: "Insights",
    items: [
      { href: "/admin", label: "Overview", icon: "overview" },
      { href: "/admin/users", label: "Users", icon: "users" },
      { href: "/admin/incidents", label: "Incidents", icon: "incidents" },
    ],
  },
  {
    label: "Operations",
    items: [
      { href: "/admin/sites", label: "Sites", icon: "sites" },
      { href: "/admin/messages", label: "Messages", icon: "messages" },
      { href: "/admin/alerts", label: "Email log", icon: "mail" },
      { href: "/admin/system", label: "System health", icon: "system" },
    ],
  },
  {
    label: "Money",
    items: [
      { href: "/admin/payouts", label: "Payouts", icon: "payouts" },
      { href: "/admin/referrals", label: "Referrals", icon: "referrals" },
    ],
  },
  { label: "Security", items: [{ href: "/admin/audit", label: "Audit log", icon: "audit" }] },
];

export const ADMIN_TABS: Array<[string, string]> = ADMIN_NAV.flatMap((g) => g.items.map((i): [string, string] => [i.href, i.label]));

export function adminActive(href: string, path: string) {
  const p = path.length > 1 ? path.replace(/\/$/, "") : path;
  return href === "/admin" ? p === href : p === href || p.startsWith(`${href}/`);
}
