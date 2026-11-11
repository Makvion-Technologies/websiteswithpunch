import { FEATURE_LINKS, TOOL_LINKS } from "@/content/links";
import { RailCta } from "./RailCta";
import { RailLinks } from "./RailLinks";

const IS_DOWN = { href: "/is-down", title: "Is it down?", body: "Live checks for 160+ popular sites, by category." };

/** Sidebar for tool and “is it down?” pages: a small CTA, the other tools, then monitoring pages. */
export function ToolRail({ current, cta, ctaTitle }: { current: string; cta: string; ctaTitle?: string }) {
  const tools = [...TOOL_LINKS, IS_DOWN].filter((l) => l.href !== current);
  return (
    <>
      <RailCta title={ctaTitle} body={cta} />
      <RailLinks title="Free tools" links={tools} more={{ href: "/tools", label: "All free tools" }} />
      <RailLinks title="Monitoring" links={FEATURE_LINKS.map(({ href, title }) => ({ href, title }))} />
    </>
  );
}
