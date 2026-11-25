import { CUSTOM_MAX_SITES, PLANS } from "@/lib/plans";
import { CHANNEL_LIMIT, STATUS_PAGE_LIMIT } from "@/lib/features/limits";

export type Persona = {
  id: string;
  title: string;
  /** One-line positioning (the original card copy). */
  body: string;
  /** Before → after. */
  pain: string;
  outcome: string;
  /** What you get, in plan terms. */
  get: string;
  stat: string;
  statLabel: string;
  cta: string;
  href: string;
};


export const personas: Persona[] = [
  {
    id: "founders",
    title: "Founders",
    body: "Ship product, not pager duty. One dashboard for the sites that keep revenue flowing.",
    pain: "The site that pays the bills goes down, and you hear it from a customer.",
    outcome: "Up/down, SSL days and domain days on one dashboard, plus a Health Score for each site.",
    get: `Starter covers up to ${PLANS.starter.siteLimit} sites for $${PLANS.starter.price}/month, free for the first 30 days.`,
    stat: String(PLANS.starter.siteLimit),
    statLabel: `sites on ${PLANS.starter.name}, 30 days free`,
    cta: "Start free trial",
    href: "/signup?plan=starter",
  },
  {
    id: "freelancers",
    title: "Freelancers",
    body: "Client sites shouldn’t surprise you. Spot SSL and domain issues before the midnight email.",
    pain: "An expired certificate or lapsed domain on a client site becomes your emergency.",
    outcome: "Every client site in one list, with SSL and domain days left turning amber before they run out.",
    get: `Pro covers up to ${PLANS.pro.siteLimit} sites for $${PLANS.pro.price}/month, with ${CHANNEL_LIMIT.pro} alert channels and ${STATUS_PAGE_LIMIT.pro} status pages.`,
    stat: String(PLANS.pro.siteLimit),
    statLabel: `client sites on ${PLANS.pro.name}`,
    cta: "Get Pro",
    href: "/signup?plan=pro",
  },
  {
    id: "agencies",
    title: "Small agencies",
    body: "Monitor a portfolio without enterprise pricing. Business covers 100 sites; Custom grows to 500.",
    pain: "A growing portfolio, and monitoring tools built and priced for enterprise teams.",
    outcome: "One dashboard for the whole portfolio, with per-site analytics when something looks off.",
    get: `Business covers up to ${PLANS.business.siteLimit} sites for $${PLANS.business.price}/month; Custom grows 25 sites at a time, up to ${CUSTOM_MAX_SITES}.`,
    stat: String(PLANS.business.siteLimit),
    statLabel: `sites on ${PLANS.business.name}, in one view`,
    cta: "Get Business",
    href: "/signup?plan=business",
  },
];
