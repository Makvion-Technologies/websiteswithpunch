import { ratePercent } from "@/lib/referrals/config";
import type { NavIconName } from "./nav-icons";
import { byCadence } from "@/lib/monitor/config";

export type NavItem = { href: string; title: string; desc: string; icon: NavIconName };
export type NavMenu = { id: string; label: string; items: NavItem[]; footer?: { href: string; label: string } };

/**
 * Guest navbar menus. Only pages that exist today, with honest one-liners (check cadence follows FAST_CHECKS).
 * Add comparison pages and status pages here once they ship. Billing help lives in the footer.
 */
export const NAV_MENUS: NavMenu[] = [
  {
    id: "product",
    label: "Product",
    items: [
      { href: "/uptime-monitoring", title: "Uptime monitoring", desc: byCadence("Checks every 1–5 minutes, confirmed alerts and 90 days of history.", "Daily checks, rechecks on demand and 90 days of history."), icon: "pulse" },
      { href: "/ssl-certificate-monitoring", title: "SSL monitoring", desc: "Days left on every certificate, with alerts before expiry.", icon: "lock" },
      { href: "/domain-expiry-monitoring", title: "Domain expiry monitoring", desc: "Renewal dates for your own and your clients' domains.", icon: "globe" },
      { href: "/#how-it-works", title: "How it works", desc: "Add a site, get a health score and the top fixes.", icon: "chart" },
    ],
    footer: { href: "/pricing", label: "See plans and pricing" },
  },
  {
    id: "tools",
    label: "Free tools",
    items: [
      { href: "/tools/website-down-checker", title: "Website down checker", desc: "Down for everyone or just you? Status and response time.", icon: "pulse" },
      { href: "/tools/ssl-checker", title: "SSL checker", desc: "Issuer, expiry date and browser trust for any domain.", icon: "lock" },
      { href: "/tools/domain-expiry-checker", title: "Domain expiry checker", desc: "Registrar and expiry date, read live over RDAP.", icon: "globe" },
      { href: "/is-down", title: "Is it down?", desc: "Live checks for 160+ popular sites, by category.", icon: "link" },
    ],
    footer: { href: "/tools", label: "All free tools" },
  },
  {
    id: "resources",
    label: "Resources",
    items: [
      { href: "/blog", title: "Blog", desc: "Guides on uptime, SSL renewal, domains and fixing outages.", icon: "book" },
      { href: "/#faq", title: "FAQ", desc: "Checks, alerts, plans and billing, answered.", icon: "help" },
      { href: "/referrals", title: "Referral program", desc: `Earn ${ratePercent}% when friends you refer pay for a plan.`, icon: "gift" },
      { href: "/contact?topic=general", title: "Contact us", desc: "Questions or feedback? We reply within 1–2 business days.", icon: "mail" },
    ],
  },
];

export const NAV_PRICING = { href: "/pricing", label: "Pricing" };
