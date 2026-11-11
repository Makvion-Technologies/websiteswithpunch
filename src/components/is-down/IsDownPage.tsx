import { IconPulse } from "@/components/marketing/icons";
import { Article } from "@/components/seo/Article";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { FaqBlock } from "@/components/seo/FaqBlock";
import { SplitLayout } from "@/components/layout/SplitLayout";
import { ToolRail } from "@/components/layout/ToolRail";
import { StageChip, ToolStage } from "@/components/tools/ToolStage";
import { siteCopy } from "@/content/is-down/copy";
import { relatedSites, type DownSite } from "@/content/is-down";
import { IsDownCheck } from "./IsDownCheck";
import { SiteGrid } from "./SiteGrid";

/** One statically generated “Is X down?” page: check button, guidance, FAQ, related sites; tools + CTA in the sidebar. */
export function IsDownPage({ site }: { site: DownSite }) {
  const c = siteCopy(site);
  const related = relatedSites(site.host, 9);
  return (
    <SplitLayout aside={<ToolRail current="/is-down" cta={c.cta} ctaTitle="Monitor your own site free" />}>
      <Breadcrumbs
        items={[
          { name: "Is a site down?", href: "/is-down" },
          { name: site.name, href: `/is-down/${site.host}` },
        ]}
      />
      <p className="label-caps mt-8 text-accent">{site.catLabel}</p>
      <h1 className="mt-3 font-display text-3xl font-medium tracking-tight text-ink sm:text-[2.6rem] sm:leading-[1.1]">
        {c.h1}
      </h1>
      <p className="mt-4 text-base leading-relaxed text-muted sm:text-lg">{c.intro}</p>
      <ToolStage
        className="mt-8"
        icon={<IconPulse className="h-4 w-4" />}
        title={site.host}
        badge={<StageChip>Free · no signup</StageChip>}
      >
        <IsDownCheck host={site.host} />
      </ToolStage>
      <div className="mt-16">
        <Article sections={c.sections} />
      </div>
      <div className="mt-16">
        <FaqBlock faqs={c.faqs} />
      </div>
      <div className="mt-16">
        <SiteGrid sites={related} title={`Other ${site.catLabel.toLowerCase()} sites`} />
      </div>
    </SplitLayout>
  );
}
