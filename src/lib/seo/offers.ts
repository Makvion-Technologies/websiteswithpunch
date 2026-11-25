import { CUSTOM, CUSTOM_MAX_SITES, CUSTOM_MIN_SITES, PAID_PLAN_IDS, PLANS } from "@/lib/plans";
import { sizedPrice } from "@/lib/billing-interval";
import { SITE_URL } from "@/lib/site-config";

/**
 * schema.org offers for the plans on sale, from the same config the pricing cards read: one
 * monthly Offer per plan and an AggregateOffer for Custom (Business + 25-site blocks). The
 * retired Free plan is not on sale, so it is not listed.
 */
const monthly = (price: number) => ({
  "@type": "UnitPriceSpecification",
  price: String(price),
  priceCurrency: "USD",
  unitText: "MONTH",
  billingDuration: "P1M",
});

export function planOffers() {
  const plans = PAID_PLAN_IDS.map((id) => {
    const p = PLANS[id];
    return {
      "@type": "Offer",
      name: p.name,
      price: String(p.price),
      priceCurrency: "USD",
      priceSpecification: monthly(p.price),
      availability: "https://schema.org/InStock",
      url: `${SITE_URL}/pricing`,
      description: p.description,
    };
  });
  const low = sizedPrice("business", CUSTOM.minBlocks, "month");
  const high = sizedPrice("business", CUSTOM.maxBlocks, "month");
  const custom = {
    "@type": "AggregateOffer",
    name: "Custom",
    lowPrice: String(low),
    highPrice: String(high),
    priceCurrency: "USD",
    offerCount: CUSTOM.maxBlocks - CUSTOM.minBlocks + 1,
    availability: "https://schema.org/InStock",
    url: `${SITE_URL}/pricing`,
    description: `${CUSTOM_MIN_SITES} to ${CUSTOM_MAX_SITES} sites: Business plus $${CUSTOM.blockPrice}/month for each extra ${CUSTOM.blockSites} sites.`,
  };
  return [...plans, custom];
}
