import type { BlogPost } from "../types";
import body from "./status-page-guide.md";

export const post: BlogPost = {
  slug: "status-page-guide",
  title: "How to Set Up a Status Page (with Update Templates)",
  h1: "How to set up a status page, with incident update templates",
  description:
    "What a status page should show, where to host it so it survives an outage, the four incident stages and copy-ready update templates for every stage.",
  category: "uptime",
  query: "how to create a status page",
  published: "2026-11-11",
  updated: "2026-11-11",
  body,
  related: ["website-maintenance-without-hurting-seo", "cost-of-website-downtime", "uptime-percentage-explained"],
  faqs: [
    {
      q: "What should a status page include?",
      a: "An overall status, per-component status, active incidents with timestamped updates, scheduled maintenance, incident history and a way to subscribe.",
    },
    {
      q: "Where should I host my status page?",
      a: "On different infrastructure from your main site, ideally a static page on a separate provider, so it stays up when the site goes down.",
    },
    {
      q: "How often should I update a status page during an incident?",
      a: "Promise a time for the next update in every post and keep that promise, even if the update is that you're still working on it.",
    },
  ],
};
