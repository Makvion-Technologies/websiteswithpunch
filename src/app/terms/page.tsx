import type { Metadata } from "next";
import { A, H2, LegalContact, LegalPage, P } from "@/components/legal/LegalPage";
import { ReferralTerms } from "@/components/legal/ReferralTerms";
import { byCadence } from "@/lib/monitor/config";

const title = "Terms of Service";
const description =
  "Terms that apply when you use Websites With Punch, a website monitoring subscription by Makvion Technologies, including accounts, plans and acceptable use.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/terms" },
  openGraph: { title: `${title} · Websites With Punch`, description, url: "/terms" },
  twitter: { title: `${title} · Websites With Punch`, description },
};

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service" updated="November 25, 2026" path="/terms">
      <P>
        These Terms govern your use of Websites With Punch at{" "}
        <a className="text-accent underline underline-offset-2 hover:no-underline" href="https://websiteswithpunch.com">
          websiteswithpunch.com
        </a>
        , a software product operated by <strong>Makvion Technologies</strong>, based in India
        (&quot;we&quot;, &quot;us&quot;). By creating an account or using the service, you agree to
        these Terms, our <A href="/privacy">Privacy Policy</A> and our{" "}
        <A href="/refund-policy">Refund &amp; Cancellation Policy</A>.
      </P>

      <H2>About the Service</H2>
      <P>
        Websites With Punch is a software-as-a-service (SaaS) subscription for website
        monitoring: uptime checks, SSL certificate expiry checks and best-effort domain expiry
        lookups, shown on an online dashboard, with email alerts when a check finds a site down
        or back up and as SSL certificates and domains approach expiry. It is a digital service you use in your browser
        right after you sign up. No physical goods are sold or shipped.
      </P>
      <P>
        Monitoring is informational and may be delayed, incomplete, or unavailable. Domain expiry
        information relies on public RDAP/WHOIS sources and is not guaranteed to be accurate or
        continuously available. {byCadence(
          "Uptime is checked at intervals (about every minute on paid plans, every 3 minutes for sites beyond the first 100 on Custom, and every 5 minutes on legacy Free accounts) and SSL and domain expiry about once a day, so problems between checks can be missed and alert emails may be delayed or not delivered.",
          "Sites are checked about once a day and when you press Recheck, so alert emails are not real-time and may be delayed or not delivered.",
        )} You can turn alerts off
        in your dashboard or with the unsubscribe link in any alert email.
      </P>

      <H2>Accounts &amp; Plans</H2>
      <P>
        New accounts choose a paid plan (Starter, Pro, Business or Custom), billed monthly or yearly
        at the prices shown on our <A href="/pricing">Pricing</A> page. Each plan monitors up to the
        number of sites shown there; Custom is Business with extra sites added in blocks of 25.
        Accounts created before paid-only plans were introduced keep the Free plan (1 site) for as
        long as the account stays open; Free is not available to new accounts.
      </P>
      <P>
        Starter includes a one-time 30-day free trial, limited to one per person, card and
        payment method. A valid payment method is required to start it, and nothing is charged
        during the trial. Unless you cancel before it ends, the trial converts automatically into a
        paid Starter subscription and your payment method is charged the Starter price for the
        billing period you chose. Upgrading to another plan during the trial ends the trial and
        charges the new plan&apos;s full price right away. Pro, Business and Custom have no trial
        and are charged when you subscribe. We may decline or end a trial that we reasonably believe
        is a repeat or misuse.
      </P>
      <P>
        You are responsible for keeping your account credentials secure and for ensuring that the
        URLs and other information you submit to the service are accurate and that you are
        authorized to monitor the websites or systems you submit.
      </P>

      <H2>Acceptable Use</H2>
      <P>
        You must not use the service to attack, abuse, disrupt, or unauthorizedly access systems, or
        to perform abusive scraping or monitoring of systems you are not authorized to check.
      </P>
      <P>
        We may suspend or terminate accounts that violate these Terms, abuse the platform, or create
        a security or operational risk to the service or other users.
      </P>

      <H2>Payments &amp; Billing</H2>
      <P>
        Payments are processed by Dodo Payments, which acts as the merchant of record for your
        purchase: it sells the subscription to you on our behalf, collects payment and handles
        sales tax, VAT or GST where it applies. Its{" "}
        <A href="https://dodopayments.com/legal/buyer-terms">buyer terms</A> also apply to the
        payment, and its name may appear on your card statement. We never see or store your full
        card number.
      </P>
      <P>
        Paid subscriptions renew automatically at the end of each billing period (monthly or yearly)
        until canceled. You can cancel anytime from Your plan page or from the Dodo Payments
        customer portal (Manage billing).
      </P>
      <P>
        Prices are stated in USD unless otherwise specified. Applicable taxes may be added at
        checkout, and your bank may apply currency-conversion or other fees.
      </P>
      <P>
        Payments are non-refundable, including after you cancel, except in the limited cases set
        out in our <A href="/refund-policy">Refund &amp; Cancellation Policy</A>. When you cancel,
        downgrade, reduce a Custom size, or switch from annual to monthly billing, no refund or credit
        is provided for the remaining time of the current billing period. You keep your current
        plan and capacity until the end of the period you have paid for, and the change takes
        effect at renewal.
      </P>
      <P>
        Upgrades and larger Custom sizes take effect immediately and are charged right away on a
        prorated basis: unused time on your current subscription is credited, the new total is
        charged, and your billing date moves to that day. An upgrade during the Starter trial is
        charged at the new plan&apos;s full price, since nothing was paid for the trial.
      </P>

      <ReferralTerms />

      <H2>Disclaimer</H2>
      <P>
        THE SERVICE IS PROVIDED “AS IS” WITHOUT WARRANTIES OF ANY KIND. We do not guarantee
        uninterrupted availability, continuous monitoring, or the accuracy or completeness of
        monitoring results.
      </P>
      <P>
        To the maximum extent permitted by applicable law, Makvion Technologies is not liable for
        downtime of your websites, missed or delayed status changes or alert emails, expired certificates or domains,
        loss of data, business interruption, or consequential or indirect damages arising from your
        use of the service.
      </P>

      <H2>Changes to the Service</H2>
      <P>
        We may modify, improve, suspend, or discontinue features of the service from time to time.
        We will make reasonable efforts to communicate material changes where appropriate.
      </P>

      <H2>Changes to These Terms</H2>
      <P>
        We may update these Terms from time to time. When we make material changes, we will update
        the “Last updated” date on this page and provide additional notice where appropriate. Your
        continued use of the service after updated Terms become effective constitutes acceptance of
        the revised Terms.
      </P>

      <H2>Governing Law</H2>
      <P>
        These Terms are governed by the laws of India, and disputes arising from them or from the
        service are subject to the jurisdiction of the courts of India. This does not limit any
        rights you have under the mandatory consumer laws of the country where you live.
      </P>

      <LegalContact />
    </LegalPage>
  );
}
