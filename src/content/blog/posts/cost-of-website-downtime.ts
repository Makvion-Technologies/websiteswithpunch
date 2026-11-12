import type { BlogPost } from "../types";
import body from "./cost-of-website-downtime.md";

export const post: BlogPost = {
  slug: "cost-of-website-downtime",
  title: "How to Calculate the Cost of Website Downtime",
  h1: "How to calculate the cost of website downtime (with a worked example)",
  description:
    "A simple formula for the real cost of a website outage: lost revenue, staff time, recovery and hidden costs, with a worked example for a small shop.",
  category: "uptime",
  query: "cost of website downtime calculator",
  published: "2026-11-11",
  updated: "2026-11-11",
  body,
  related: ["uptime-percentage-explained", "uptime-check-intervals", "website-maintenance-checklist"],
  faqs: [
    {
      q: "What is the average cost of downtime per minute?",
      a: "The often-quoted $5,600 per minute comes from a 2014 Gartner estimate based on large enterprises. It isn't a useful figure for a small business; calculate your own from your revenue and team costs.",
    },
    {
      q: "How do I calculate lost revenue from an outage?",
      a: "Take your monthly online revenue ÷ 720 to get an average hour, multiply by the outage length and a peak factor for the time of day, then subtract the share of customers likely to come back later.",
    },
    {
      q: "Does downtime affect SEO?",
      a: "Short outages don't. Google's documentation says repeated 5xx errors slow crawling, and URLs that keep returning server errors are eventually dropped from the index.",
    },
  ],
};
