import type { BlogPost } from "../types";
import body from "./uptime-percentage-explained.md";

export const post: BlogPost = {
  slug: "uptime-percentage-explained",
  title: "99.9% Uptime Explained: Downtime per Month and Year",
  h1: "What 99.9% uptime really means: allowed downtime, explained",
  description:
    "How much downtime 99%, 99.9%, 99.95% and 99.99% uptime allow per day, month and year, how SLAs measure it, and which uptime target fits your site.",
  category: "uptime",
  query: "99.9 uptime downtime per month",
  published: "2026-11-11",
  updated: "2026-11-11",
  body,
  related: ["uptime-check-intervals", "cost-of-website-downtime", "status-page-guide"],
  faqs: [
    {
      q: "How much downtime is 99.9% uptime per month?",
      a: "About 43 minutes in a 30-day month (43,200 minutes × 0.1%), or roughly 8 hours 46 minutes a year.",
    },
    {
      q: "Is 99% uptime good?",
      a: "Not for most businesses. 99% allows 7 hours 12 minutes of downtime a month, or more than three and a half days a year. Most hosts and SaaS tools aim for at least 99.9%.",
    },
    {
      q: "How do you calculate uptime percentage?",
      a: "Divide the minutes the site was up by the total minutes in the period and multiply by 100. For example, 57 minutes of downtime in a 30-day month gives (43,200 − 57) ÷ 43,200 × 100 = 99.868%.",
    },
    {
      q: "Does planned maintenance count against an SLA?",
      a: "Usually not. Most SLAs exclude scheduled maintenance announced in advance, but the exact rules differ by provider, so read the definitions section of the agreement.",
    },
  ],
};
