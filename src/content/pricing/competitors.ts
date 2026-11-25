/**
 * Competitor list prices for the /pricing comparison. Monthly price in USD for the smallest
 * public tier that covers the column (the tier's own monitor count in brackets), before tax,
 * as shown on each pricing page on PRICES_CHECKED. Re-check before changing any number.
 */
export const PRICES_CHECKED = "25 Nov 2026";
export const PRICES_CHECKED_ISO = "2026-11-25";

export type Cell = { price: string; tier?: string } | null;

export type Competitor = {
  name: string;
  url: string;
  ten: Cell;
  thirty: Cell;
  hundred: Cell;
  free: string;
  note?: string;
};

export const COMPETITORS: Competitor[] = [
  {
    name: "UptimeRobot",
    url: "https://uptimerobot.com/pricing/",
    ten: { price: "$10", tier: "Solo, 10" },
    thirty: { price: "$22", tier: "Solo, 50" },
    hundred: { price: "$35", tier: "Team, 100" },
    free: "50 monitors, 5-minute checks",
    note: "The page showed two sets of prices ($10/$22/$35 and $13/$39); we list the lower ones.",
  },
  {
    name: "Pingdom",
    url: "https://www.pingdom.com/pricing/",
    ten: { price: "$18", tier: "10 checks" },
    thirty: { price: "$40", tier: "25 checks" },
    hundred: { price: "$149", tier: "100 checks" },
    free: "None (trial only)",
  },
  {
    name: "StatusCake",
    url: "https://www.statuscake.com/pricing/",
    ten: null,
    thirty: null,
    hundred: { price: "$24.49", tier: "Superior: 100 uptime, 50 SSL, 50 domain" },
    free: "10 monitors, 5-minute checks",
  },
  {
    name: "HetrixTools",
    url: "https://hetrixtools.com/pricing/uptime-monitor/",
    ten: null,
    thirty: { price: "$9.95", tier: "Professional, 30" },
    hundred: { price: "$49.95", tier: "Enterprise, 200" },
    free: "15 monitors, 1-minute checks",
  },
  {
    name: "Site24x7",
    url: "https://www.site24x7.com/site24x7-pricing.html",
    ten: null,
    thirty: { price: "$10", tier: "Web Uptime, 25 sites" },
    hundred: null,
    free: "None (trial only)",
  },
  {
    name: "Oh Dear",
    url: "https://ohdear.app/pricing",
    ten: { price: "$55", tier: "Freelance, 10" },
    thirty: { price: "$109", tier: "Studio, 25" },
    hundred: { price: "$275", tier: "Portfolio, 100" },
    free: "None (trial only)",
  },
];
