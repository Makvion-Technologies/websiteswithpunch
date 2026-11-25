import type { ReactNode } from "react";

export type AdminIconName = "overview" | "users" | "incidents" | "sites" | "messages" | "mail" | "system" | "payouts" | "referrals" | "audit";

/** Same grid and stroke as the dashboard icons (24px, 1.75, square caps). */
const PATHS: Record<AdminIconName, ReactNode> = {
  overview: <path d="M4 4h7v7H4zM13 4h7v4h-7zM13 10h7v10h-7zM4 13h7v7H4z" />,
  users: <><circle cx="9" cy="8" r="3.5" /><path d="M3 20c.6-3.5 3-5.5 6-5.5s5.4 2 6 5.5M16 4.5a3.5 3.5 0 0 1 0 7M18 14.8c1.7.8 2.7 2.6 3 5.2" /></>,
  incidents: <path d="M12 3 2.5 20h19zM12 10v4.5M12 17v.01" />,
  sites: <path d="M3 12h4l2.5-6 4 12 2.5-6H21" />,
  messages: <path d="M4 5h16v11H9l-5 4z" />,
  mail: <path d="M3 6h18v12H3zM3 6l9 7 9-7" />,
  system: <><path d="M4 4h16v6H4zM4 14h16v6H4z" /><path d="M7.5 7h.01M7.5 17h.01" strokeWidth={2.5} /></>,
  payouts: <path d="M3 7h18v11H3zM3 11h18M7 15h3" />,
  referrals: <><circle cx="6" cy="12" r="2.5" /><circle cx="18" cy="6" r="2.5" /><circle cx="18" cy="18" r="2.5" /><path d="m8.3 10.8 7.4-3.6M8.3 13.2l7.4 3.6" /></>,
  audit: <path d="M12 3 4 6v6c0 4.5 3.4 7.8 8 9 4.6-1.2 8-4.5 8-9V6zM8.5 12l2.5 2.5 4.5-5" />,
};

export function AdminIcon({ name, className = "h-[18px] w-[18px]" }: { name: AdminIconName; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="square" className={className} aria-hidden>
      {PATHS[name]}
    </svg>
  );
}
