import type { DashIconName } from "./icons";

export type DashNavItem = { href: string; label: string; icon: DashIconName; /** Exact match only (no sub-paths). */ exact?: boolean; /** Extra path prefixes that count as this item. */ also?: string[] };
export type DashNavGroup = { label: string; items: DashNavItem[] };

/** Dashboard information architecture (see /workspace/plans/dashboard-ux-research.md). */
export function dashNav(heartbeats: boolean): DashNavGroup[] {
  return [
    {
      label: "Monitor",
      items: [
        { href: "/dashboard", label: "Overview", icon: "overview", exact: true },
        { href: "/dashboard/monitors", label: "Monitors", icon: "monitors", also: ["/dashboard/sites"] },
        ...(heartbeats ? [{ href: "/dashboard/cron-jobs", label: "Cron jobs", icon: "cron" as const }] : []),
        { href: "/dashboard/expiry", label: "Expiry calendar", icon: "calendar" },
      ],
    },
    {
      label: "Share & alert",
      items: [
        { href: "/dashboard/status-pages", label: "Status pages", icon: "status" },
        { href: "/dashboard/alerts", label: "Alerts & integrations", icon: "alerts" },
        { href: "/dashboard/reports", label: "Weekly report", icon: "report" },
      ],
    },
    { label: "Account", items: [{ href: "/dashboard/settings", label: "Settings", icon: "settings" }] },
  ];
}

/** Bottom bar on phones: four destinations plus More. */
export const MOBILE_PRIMARY = ["/dashboard", "/dashboard/monitors", "/dashboard/alerts", "/dashboard/status-pages"];
export const MOBILE_SHORT: Record<string, string> = {
  "/dashboard": "Overview",
  "/dashboard/monitors": "Monitors",
  "/dashboard/alerts": "Alerts",
  "/dashboard/status-pages": "Status",
};

export function isActive(item: DashNavItem, path: string): boolean {
  const p = path.length > 1 ? path.replace(/\/$/, "") : path;
  const hit = (base: string) => p === base || p.startsWith(`${base}/`);
  if (item.exact) return p === item.href;
  return hit(item.href) || (item.also ?? []).some(hit);
}
