import type { ReactNode, SVGProps } from "react";
import { IconBell, IconChart, IconGlobe, IconLink, IconLock, IconPulse } from "@/components/marketing/icons";

type P = SVGProps<SVGSVGElement>;

function Base({ children, ...props }: P & { children: ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="square" aria-hidden {...props}>
      {children}
    </svg>
  );
}

function IconHelp(props: P) {
  return (
    <Base {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .8-1 1.5V14M12 17h.01" />
    </Base>
  );
}

function IconGift(props: P) {
  return (
    <Base {...props}>
      <path d="M4 11h16v9H4zM3 7h18v4H3zM12 7v13M12 7c-1-3-5-3-5-1s3 1 5 1c2 0 5 1 5-1s-4-2-5 1" />
    </Base>
  );
}

function IconMail(props: P) {
  return (
    <Base {...props}>
      <path d="M3 6h18v12H3zM3 7l9 6 9-6" />
    </Base>
  );
}

function IconCard(props: P) {
  return (
    <Base {...props}>
      <path d="M3 6h18v12H3zM3 10h18M7 15h4" />
    </Base>
  );
}

/** Icons by name, so the nav data stays plain (serialisable) objects. */
export const NAV_ICONS = {
  pulse: IconPulse,
  lock: IconLock,
  globe: IconGlobe,
  chart: IconChart,
  link: IconLink,
  bell: IconBell,
  help: IconHelp,
  gift: IconGift,
  mail: IconMail,
  card: IconCard,
} as const;

export type NavIconName = keyof typeof NAV_ICONS;

export function NavIcon({ name, className = "h-4 w-4" }: { name: NavIconName; className?: string }) {
  const Icon = NAV_ICONS[name];
  return <Icon className={className} />;
}
