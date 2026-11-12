import { CtaBand } from "@/components/marketing/StartCta";
import type { Metadata } from "next";
import { AudienceSection } from "@/components/marketing/AudienceSection";
import { PricingSection } from "@/components/marketing/sections-audience-pricing";
import {
  FaqSection,
  FinalCtaSection,
} from "@/components/marketing/sections-faq-cta";
import { FeaturesSection } from "@/components/marketing/sections-mid";
import { ProductPreviewSection } from "@/components/marketing/sections-preview";
import { WhyItMattersSection } from "@/components/marketing/sections-why";
import { HowItWorksSection } from "@/components/marketing/sections-how";
import { HeroSection } from "@/components/marketing/sections-hero";
import { IntroLine, ProofStrip } from "@/components/marketing/sections-top";
import { HomeToolsStrip } from "@/components/marketing/HomeToolsStrip";
import { HomeJsonLd } from "@/components/marketing/HomeJsonLd";
import { byCadence } from "@/lib/monitor/config";

export const metadata: Metadata = {
  title: { absolute: "Uptime, SSL & Domain Expiry Monitoring | Websites With Punch" },
  description:
    byCadence(
      "Website monitoring for freelancers, agencies and small businesses: uptime checked every minute (every 5 on Free), plus SSL and domain expiry, on one dashboard. Free for one site.",
      "Website monitoring for freelancers, agencies and small businesses: daily uptime, SSL certificate and domain expiry checks on one dashboard. Free for one site.",
    ),
  alternates: { canonical: "/" },
};

// Static: signed-in visitors are sent to /dashboard by middleware.ts before this page is served.
export const dynamic = "force-static";

export default function HomePage() {
  return (
    <div>
      <HomeJsonLd />
      <HeroSection />
      <IntroLine />
      <ProofStrip />
      <HowItWorksSection />
      <FeaturesSection />
      <HomeToolsStrip />
      <CtaBand line={byCadence("Uptime checked every few minutes, SSL and domain expiry every day, all on one dashboard.", "Uptime, SSL and domain expiry for your site, checked every day.")} />
      <WhyItMattersSection />
      <ProductPreviewSection />
      <CtaBand line="Add your site and see it on this dashboard." />
      <AudienceSection />
      <PricingSection />
      <FaqSection />
      <FinalCtaSection />
    </div>
  );
}
