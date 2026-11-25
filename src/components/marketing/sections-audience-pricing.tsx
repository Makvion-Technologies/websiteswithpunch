"use client";

import Link from "next/link";
import { useState } from "react";
import { type BillingInterval } from "@/lib/billing-interval";
import { CUSTOM, PLANS, customSites } from "@/lib/plans";
import { TAX_NOTE_CHECKOUT } from "@/lib/tax-copy";
import { BillingIntervalToggle } from "@/components/BillingIntervalToggle";
import { CustomSizeSlider } from "@/components/CustomSizeSlider";
import { PricingCard } from "./PricingCard";
import { DEFAULT_CUSTOM_BLOCKS, customPlanHref, maxSelfServeSites, pricingPlans } from "./pricing-content";

const legalLink = "underline underline-offset-4 hover:text-ink";

/** Homepage pricing; /pricing renders it with an h1 (`as`). */
export function PricingSection({ as: Heading = "h2" }: { as?: "h1" | "h2" }) {
  const [interval, setBilling] = useState<BillingInterval>("month");
  const [blocks, setBlocks] = useState(DEFAULT_CUSTOM_BLOCKS);
  return (
    <section id="pricing" className="border-b border-rule bg-bg">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-xl">
            <Heading className="font-display text-3xl font-medium text-ink sm:text-4xl">Simple pricing</Heading>
            <p className="mt-3 text-muted">
              Every plan checks uptime, SSL certificates and domain expiry on every site. Try Starter free for 30 days,
              or start on Pro, Business or Custom right away. Pay monthly, or yearly and get 2 months free.
            </p>
          </div>
          <BillingIntervalToggle value={interval} onChange={setBilling} className="shrink-0 self-start sm:self-auto" />
        </div>

        {Heading === "h1" ? <h2 className="sr-only">Plans</h2> : null}
        <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4 lg:gap-y-0">
          {pricingPlans.map((plan) => (
            <PricingCard
              key={plan.id}
              plan={plan}
              interval={interval}
              blocks={plan.id === "custom" ? blocks : 0}
              size={
                plan.id === "custom" ? (
                  <CustomSizeSlider compact blocks={blocks} onChange={setBlocks} interval={interval} />
                ) : (
                  <p>
                    <span className={`font-display text-xl font-medium ${plan.id === "pro" ? "text-solid-fg" : "text-ink"}`}>
                      {PLANS[plan.id].siteLimit}
                    </span>{" "}
                    sites included
                  </p>
                )
              }
            />
          ))}
        </div>

        <div className="mt-8 space-y-2 text-sm text-muted">
          <p>
            {TAX_NOTE_CHECKOUT} Custom is Business plus ${CUSTOM.blockPrice}/month (${CUSTOM.blockPrice * 10}/year) for every{" "}
            {CUSTOM.blockSites} extra sites, from {customSites(CUSTOM.minBlocks)} to {maxSelfServeSites}; the first 100 sites are
            checked every minute and the rest every 3 minutes.
          </p>
          <p>
            The Starter trial needs a payment method and charges nothing for 30 days; cancel before it ends and
            you&apos;re never charged. Subscriptions renew automatically. Cancel anytime and keep your plan until the end
            of the period you&apos;ve paid for. Payments are non-refundable, apart from the few exceptions in our{" "}
            <Link href="/refund-policy" className={legalLink}>
              Refund &amp; Cancellation Policy
            </Link>
            . See also our{" "}
            <Link href="/terms" className={legalLink}>
              Terms of Service
            </Link>
            .
          </p>
        </div>

        <div className="mt-6 flex flex-col gap-2 text-sm text-muted sm:flex-row sm:justify-between">
          <p>
            Need more than {maxSelfServeSites} sites?{" "}
            <Link href={customPlanHref} className="font-semibold text-ink underline-offset-2 hover:underline">
              Contact us
            </Link>
            .
          </p>
          <p>
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-ink underline-offset-2 hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
