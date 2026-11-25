import type { ReactNode } from "react";

/** Dashboard nav icons: 24px grid, 1.75 stroke, square caps (same as the navbar icons). */
function Base({ children, className = "h-[18px] w-[18px]" }: { children: ReactNode; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="square" className={className} aria-hidden>
      {children}
    </svg>
  );
}

export type DashIconName = "overview" | "monitors" | "cron" | "calendar" | "status" | "alerts" | "report" | "settings" | "more";

const PATHS: Record<DashIconName, ReactNode> = {
  overview: <path d="M4 4h7v7H4zM13 4h7v4h-7zM13 10h7v10h-7zM4 13h7v7H4z" />,
  monitors: <path d="M3 12h4l2.5-6 4 12 2.5-6H21" />,
  cron: (
    <>
      <circle cx="12" cy="13" r="8" />
      <path d="M12 9v4l2.5 2.5M9 2h6" />
    </>
  ),
  calendar: <path d="M4 6h16v14H4zM4 10h16M8 3v4M16 3v4M8 14h2M14 14h2M8 17h2" />,
  status: (
    <>
      <path d="M4 5h16v14H4z" />
      <path d="M7 9h2M7 12.5h2M7 16h2M12 9h5M12 12.5h5M12 16h5" />
    </>
  ),
  alerts: <path d="M6 16V11a6 6 0 1 1 12 0v5l1.5 2h-15zM10 20.5h4" />,
  report: <path d="M5 3h10l4 4v14H5zM15 3v4h4M8.5 17v-3M12 17v-6M15.5 17v-4" />,
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1" />
    </>
  ),
  more: <path d="M5 12h.01M12 12h.01M19 12h.01" strokeWidth={3} />,
};

export function DashIcon({ name, className }: { name: DashIconName; className?: string }) {
  return <Base className={className}>{PATHS[name]}</Base>;
}
