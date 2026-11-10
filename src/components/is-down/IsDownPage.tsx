import { IconPulse } from "@/components/marketing/icons";
import { Article } from "@/components/seo/Article";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { FaqBlock } from "@/components/seo/FaqBlock";
import { RelatedLinks } from "@/components/seo/RelatedLinks";
import { SoftCta } from "@/components/seo/SoftCta";
import { StageChip, ToolStage } from "@/components/tools/ToolStage";
import { siteCopy } from "@/content/is-down/copy";
import { relatedSites, type DownSite } from "@/content/is-down";
import { IsDownCheck } from "./IsDownCheck";
import { SiteGrid } from "./SiteGrid";

/** One statically generated “Is X down?” page: check button, category guidance, FAQ, related sites. */
export function IsDownPage({ site }: { site: DownSite }) {
  const c = siteCopy(site);
  const related = relatedSites(site.host, 9);
  return (
    <div className="mx-auto max-w-3xl px-4 pb-20 pt-8 sm:px-6 sm:pt-12">
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
        <SoftCta title="Monitor your own site free" body={c.cta} />
      </div>
      <div className="mt-16">
        <FaqBlock faqs={c.faqs} />
      </div>
      <div className="mt-16">
        <SiteGrid sites={related} title={`Other ${site.catLabel.toLowerCase()} sites`} />
      </div>
      <div className="mt-16">
        <RelatedLinks
          title="Free tools"
          links={[
            { href: "/tools/website-down-checker", title: "Website down checker", body: "Check any website, not just the ones on this list." },
            { href: "/tools/ssl-checker", title: "SSL checker", body: "Certificate expiry, issuer and whether browsers trust it." },
            { href: "/tools/domain-expiry-checker", title: "Domain expiry check", body: "Registrar and expiration date, read from the registry." },
            { href: "/is-down", title: "All “is it down?” pages", body: "Live checks for 150+ popular sites, grouped by category." },
          ]}
        />
      </div>
    </div>
  );
}
