import { IconGlobe, IconLock, IconPulse } from "@/components/marketing/icons";
import type { BlogCategory } from "@/content/blog/types";
import type { SVGProps } from "react";

function IconWrench(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden {...props}>
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.8-3.8a6 6 0 0 1-7.9 7.9l-6.9 6.9a2.1 2.1 0 0 1-3-3l6.9-6.9a6 6 0 0 1 7.9-7.9z" />
    </svg>
  );
}

const ICONS = { uptime: IconPulse, ssl: IconLock, domains: IconGlobe, fixes: IconWrench } as const;

export function CategoryIcon({ id, className }: { id: BlogCategory; className?: string }) {
  const I = ICONS[id];
  return <I className={className} aria-hidden />;
}
