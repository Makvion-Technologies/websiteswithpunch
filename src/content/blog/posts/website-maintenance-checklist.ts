import type { BlogPost } from "../types";
import body from "./website-maintenance-checklist.md";

export const post: BlogPost = {
  slug: "website-maintenance-checklist",
  title: "Client Website Maintenance Checklist: What to Monitor",
  h1: "Website maintenance checklist for client sites: daily to yearly",
  description:
    "A practical maintenance checklist for agencies and freelancers: what to check daily, weekly, monthly, quarterly and yearly on every client website.",
  category: "uptime",
  query: "website maintenance checklist",
  published: "2026-11-11",
  updated: "2026-11-11",
  body,
  related: ["what-happens-when-a-domain-expires", "ssl-certificate-validity-47-days", "cost-of-website-downtime"],
  faqs: [
    {
      q: "What should be included in website maintenance?",
      a: "Uptime, SSL and domain expiry monitoring, backups with tested restores, software updates, form tests, performance and Search Console checks, account reviews and renewal tracking.",
    },
    {
      q: "How often should a website be maintained?",
      a: "Automate daily checks, apply updates and test forms weekly, review performance and Search Console monthly, test a backup restore quarterly and review renewals and hosting yearly.",
    },
    {
      q: "What causes the most avoidable website outages?",
      a: "Expired domains, expired SSL certificates and suspended hosting accounts, all of which can be caught weeks in advance.",
    },
  ],
};
