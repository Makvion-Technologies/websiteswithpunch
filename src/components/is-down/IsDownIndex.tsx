import Link from "next/link";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { SplitLayout } from "@/components/layout/SplitLayout";
import { ToolRail } from "@/components/layout/ToolRail";
import { CATS, SITES, sitesIn } from "@/content/is-down";
import { SiteGrid } from "./SiteGrid";
import { byCadence } from "@/lib/monitor/config";

const CTA = byCadence(
  "Add your website and we check its uptime every few minutes (every minute on Pro and Business), plus SSL certificate and domain expiry daily, with email alerts when a confirmed check finds it down. Free for one site, no card needed.",
  "Add your website and we check it every day: uptime, SSL certificate expiry and domain expiry, with email alerts when a check finds it down. Free for one site, no card needed.",
);

/** Directory of every static “Is X down?” page, grouped by category; tools + CTA in the sidebar. */
export function IsDownIndex() {
  return (
    <SplitLayout aside={<ToolRail current="/is-down" cta={CTA} ctaTitle="Monitor your own site free" />}>
      <Breadcrumbs items={[{ name: "Is a site down?", href: "/is-down" }]} />
      <p className="label-caps mt-8 text-accent">Free checks</p>
      <h1 className="mt-3 font-display text-3xl font-medium tracking-tight text-ink sm:text-[2.6rem] sm:leading-[1.1]">
        Is a website down?
      </h1>
      <p className="mt-4 text-base leading-relaxed text-muted sm:text-lg">
        Pick a site to check it live from our server. You’ll see whether it answered, the HTTP status
        and the response time — so you can tell if it’s down for everyone or just for you. We don’t
        invent user reports or outage maps. For any other address, use the{" "}
        <Link href="/tools/website-down-checker" className="text-ink underline decoration-rule underline-offset-4 hover:decoration-ink">
          website down checker
        </Link>
        .
      </p>
      <p className="mt-3 text-sm text-muted">{SITES.length} sites, checked only when you press the button.</p>
      <div className="mt-14 space-y-14">
        {CATS.map(([id, label]) => (
          <SiteGrid key={id} title={label} sites={sitesIn(id)} />
        ))}
      </div>
    </SplitLayout>
  );
}
