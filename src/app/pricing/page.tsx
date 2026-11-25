import type { Metadata } from "next";
import Link from "next/link";
import { PricingSection } from "@/components/marketing/sections-audience-pricing";
import { FaqSection } from "@/components/marketing/sections-faq-cta";
import { PricingComparison } from "@/components/marketing/PricingComparison";
import { faqs } from "@/components/marketing/home-content";
import { JsonLd } from "@/components/seo/JsonLd";
import { CUSTOM_MAX_SITES, PLANS } from "@/lib/plans";
import { planOffers } from "@/lib/seo/offers";
import { SITE_NAME, SITE_URL } from "@/lib/site-config";

const title = "Uptime Monitoring Pricing – From $5/month";
const description = `Starter $${PLANS.starter.price}/mo for ${PLANS.starter.siteLimit} sites with a 30-day free trial, Pro $${PLANS.pro.price} for ${PLANS.pro.siteLimit}, Business $${PLANS.business.price} for ${PLANS.business.siteLimit}, Custom up to ${CUSTOM_MAX_SITES}. Uptime, SSL and domain expiry checks.`;

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: "/pricing" },
  openGraph: { title, description, url: "/pricing" },
  twitter: { title, description },
};

const link = "text-accent underline underline-offset-2 hover:no-underline";

const points = [
  {
    title: "A software subscription",
    body: "Websites With Punch is an online software service (SaaS). Nothing is shipped: you sign in and use the dashboard in your browser right after you sign up.",
  },
  {
    title: "How billing works",
    body: "Plans are billed in advance, monthly or yearly (yearly is 10× the monthly price), and renew automatically until you cancel. Starter begins with a 30-day free trial; the card you add is charged when it ends. Custom's extra sites bill on the same schedule.",
  },
  {
    title: "Cancel anytime",
    body: "Cancel from Your plan or Manage billing. You keep your plan until the end of the period you've paid for and aren't charged again. Cancel during the trial and you pay nothing.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Product",
      "@id": `${SITE_URL}/pricing#product`,
      name: `${SITE_NAME} website monitoring`,
      description: "Uptime, SSL certificate expiry and domain expiry monitoring for every site on one dashboard, with alerts, status pages and cron job monitors.",
      brand: { "@type": "Brand", name: SITE_NAME },
      url: `${SITE_URL}/pricing`,
      offers: planOffers(),
    },
    {
      "@type": "FAQPage",
      "@id": `${SITE_URL}/pricing#faq`,
      mainEntity: faqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ],
};

export default function PricingPage() {
  return (
    <div>
      <JsonLd data={jsonLd} />
      <PricingSection as="h1" />
      <PricingComparison />
      <section className="border-b border-rule bg-bg">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="font-display text-2xl font-medium text-ink sm:text-3xl">What you&apos;re buying</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {points.map((p) => (
              <div key={p.title} className="border border-rule bg-surface p-6">
                <h3 className="font-display text-lg font-medium text-ink">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{p.body}</p>
              </div>
            ))}
          </div>
          <p className="mt-8 text-sm text-muted">
            Full details: <Link className={link} href="/refund-policy">Refund &amp; Cancellation Policy</Link>
            {" · "}
            <Link className={link} href="/terms">Terms of Service</Link>
            {" · "}
            <Link className={link} href="/privacy">Privacy Policy</Link>. Questions?{" "}
            <Link className={link} href="/contact?topic=billing">Contact us</Link>.
          </p>
        </div>
      </section>
      <FaqSection />
    </div>
  );
}
