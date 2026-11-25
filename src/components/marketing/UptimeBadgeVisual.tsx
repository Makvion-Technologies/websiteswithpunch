import { badgeSvg, BADGE_COLORS, uptimeColor } from "@/lib/badges/svg";
import { IconLink } from "./icons";
import { Panel, VisualStage } from "./monitor-visual-parts";

/** Compact replica of the Badge tab: live SVG badges and an embed snippet. */
export function UptimeBadgeVisual() {
  return (
    <VisualStage>
      <Panel icon={<IconLink className="h-4 w-4" />} title="Uptime badges" footer={<span>Refresh every 5 minutes · Markdown or HTML</span>}>
        <div className="flex flex-wrap items-center gap-2 border border-dashed border-rule bg-bg px-3 py-3">
          <span dangerouslySetInnerHTML={{ __html: badgeSvg("uptime", "99.9%", uptimeColor(99.9)) }} />
          <span dangerouslySetInnerHTML={{ __html: badgeSvg("status", "up", BADGE_COLORS.up) }} />
        </div>
        <p className="mt-4 break-all font-mono text-[11px] leading-relaxed text-muted">
          [![Uptime (30 days)](https://www.websiteswithpunch.com/badge/…)](https://shop.example.com)
        </p>
      </Panel>
    </VisualStage>
  );
}
