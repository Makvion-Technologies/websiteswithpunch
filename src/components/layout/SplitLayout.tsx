import type { ReactNode } from "react";
import { FRAME, SPLIT } from "./frame";

/**
 * Two-column page body: the main column (tool, article, FAQ) capped at 720px, and a sidebar of
 * related links and a small CTA. The sidebar stacks under the main column on phones and tablets.
 */
export function SplitLayout({
  children,
  aside,
  className = "pb-20 pt-8 sm:pt-12",
  sticky = true,
  relative = false,
}: {
  children: ReactNode;
  aside: ReactNode;
  className?: string;
  sticky?: boolean;
  relative?: boolean;
}) {
  return (
    <div className={`${FRAME} ${relative ? "relative" : ""} ${className}`}>
      <div className={SPLIT}>
        <div className="min-w-0">{children}</div>
        <aside aria-label="Related" className="min-w-0">
          <div className={`space-y-10 ${sticky ? "lg:sticky lg:top-24" : ""}`}>{aside}</div>
        </aside>
      </div>
    </div>
  );
}
