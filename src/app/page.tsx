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

const title = "Website Uptime Monitoring – SSL & Domain Expiry";
const description = byCadence(
  "Uptime checked every minute, plus SSL and domain expiry alerts, on one dashboard. From $5/month for 10 sites, with a 30-day free trial on Starter.",
  "Monitor website uptime, SSL certificates and domain expiry on one dashboard, with email alerts. From $5/month for 10 sites, with a 30-day free trial.",
);

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: "/" },
  openGraph: { title, description, url: "/" },
  twitter: { title, description },
};

// Static: signed-in visitors are sent to /dashboard by proxy.ts before this page is served.
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
