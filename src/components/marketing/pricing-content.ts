import { CUSTOM, CUSTOM_MAX_SITES, CUSTOM_MIN_SITES, PLANS, customSites } from "@/lib/plans";
import { blockPrice, sizedPrice, type BillingInterval } from "@/lib/billing-interval";
import { byCadence, CHECK_EVERY_MIN, CUSTOM_EXTRA_EVERY_MIN } from "@/lib/monitor/config";
import { HEARTBEATS, HEARTBEAT_LIMIT } from "@/lib/heartbeats/config";
import { CHANNEL_LIMIT, STATUS_PAGE_LIMIT, planWord } from "@/lib/features/limits";
import { choiceQuery, type ChoiceId } from "@/lib/plan-choice";

export type CardId = ChoiceId;

/** Monthly-equivalent price, trimmed: 4.17, 10, 20. */
const money = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(2));

/** What a card shows per interval. Price is per month; annual notes the yearly bill. */
export type PlanPricing = { price: string; note: string; href: string };

const sitesOf = (id: CardId, blocks: number) => (id === "custom" ? customSites(blocks) : PLANS[id].siteLimit);
const planOf = (id: CardId) => (id === "custom" ? "business" : id);

/** Card pricing for an interval (and a Custom size). */
export function cardPricing(id: CardId, interval: BillingInterval, blocks = 0): PlanPricing {
  const b = id === "custom" ? blocks : 0;
  const total = sizedPrice(planOf(id), b, interval);
  const perMonth = interval === "year" ? total / 12 : total;
  const perSite = (perMonth / sitesOf(id, b)).toFixed(2);
  const href = `/signup?${choiceQuery({ id, blocks: b }, interval)}`;
  const billed = interval === "year" ? `$${total} billed yearly` : "billed monthly";
  const lead = id === "starter" ? `30 days free, then ${billed}` : billed.charAt(0).toUpperCase() + billed.slice(1);
  return { price: money(perMonth), note: `${lead} · $${perSite}/site/mo · plus tax`, href };
}

export type PlanFeature = { text: string; off?: boolean };

export type PricingPlan = {
  id: CardId;
  name: string;
  audience: string;
  cta: string;
  features: PlanFeature[];
};

const tier = (id: CardId) => (id === "custom" ? "business" : id);

/** Row 2: check cadence from CHECK_EVERY_MIN when fast checks are on. */
const checksRow = (id: CardId): PlanFeature => {
  if (id === "custom") {
    return {
      text: byCadence(
        `Uptime every minute on 100 sites, every ${CUSTOM_EXTRA_EVERY_MIN} minutes on the rest`,
        "Uptime, SSL and domain checks",
      ),
    };
  }
  const n = CHECK_EVERY_MIN[id];
  return { text: byCadence(`Uptime every ${n === 1 ? "minute" : `${n} minutes`}, SSL and domain daily`, "Uptime, SSL and domain checks") };
};

/** Heartbeat (cron job) monitors per plan; only listed once heartbeats are live. */
const hbRow = (id: CardId): PlanFeature[] =>
  HEARTBEATS ? [{ text: `${HEARTBEAT_LIMIT[tier(id)]} cron job heartbeats, from every 5 minutes` }] : [];

/** Rows every card shares (row 2 onward), with per-plan limits from lib/features/limits. */
const shared = (id: CardId): PlanFeature[] => [
  checksRow(id),
  ...hbRow(id),
  { text: `Email plus ${planWord(CHANNEL_LIMIT[tier(id)], "Slack, Discord, Telegram or webhook channel")}` },
  { text: planWord(STATUS_PAGE_LIMIT[tier(id)], "public status page") },
  { text: "Dashboard, analytics and check history" },
  { text: "Weekly report, expiry calendar and uptime badges" },
  { text: "Self-serve billing portal" },
];

/**
 * Pricing cards. Prices and limits come from PLANS / CUSTOM; only features that exist.
 * Rows are parallel across cards: 1 sites, 2… shared, last = the plan's own extra.
 */
export const pricingPlans: PricingPlan[] = [
  {
    id: "starter",
    name: PLANS.starter.name,
    audience: "For a handful of sites you can't afford to lose.",
    cta: "Start free trial",
    features: [{ text: `${PLANS.starter.siteLimit} monitored sites` }, ...shared("starter"), { text: "30-day free trial, card required" }],
  },
  {
    id: "pro",
    name: PLANS.pro.name,
    audience: "For freelancers and growing portfolios.",
    cta: "Get Pro",
    features: [{ text: `${PLANS.pro.siteLimit} monitored sites` }, ...shared("pro"), { text: "Upgrade or downgrade from the dashboard" }],
  },
  {
    id: "business",
    name: PLANS.business.name,
    audience: "For agencies and larger portfolios.",
    cta: "Get Business",
    features: [{ text: `${PLANS.business.siteLimit} monitored sites` }, ...shared("business"), { text: `Grow to ${CUSTOM_MAX_SITES} sites anytime` }],
  },
  {
    id: "custom",
    name: "Custom",
    audience: "Business, sized to your portfolio.",
    cta: "Get Custom",
    features: [
      { text: `${CUSTOM_MIN_SITES} to ${CUSTOM_MAX_SITES} monitored sites` },
      ...shared("custom"),
      { text: `Resize ${CUSTOM.blockSites} sites at a time, $${blockPrice("month")}/mo each` },
    ],
  },
];

/** Highest self-serve limit; beyond this is a contact-us plan. */
export const maxSelfServeSites = CUSTOM_MAX_SITES;

export const customPlanHref = "/contact?topic=custom-limits";

/** Sites shown first on the Custom card (server render and first paint). */
export const DEFAULT_CUSTOM_BLOCKS = 4; // 200 sites
