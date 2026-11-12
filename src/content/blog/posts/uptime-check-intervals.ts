import type { BlogPost } from "../types";
import body from "./uptime-check-intervals.md";

export const post: BlogPost = {
  slug: "uptime-check-intervals",
  title: "How Often Should You Check Website Uptime?",
  h1: "How often should you check website uptime? Check intervals explained",
  description:
    "What 30-second, 1-minute, 5-minute and daily uptime checks mean for detection time, missed outages and false alarms, and how to pick the right interval.",
  category: "uptime",
  query: "uptime monitoring check interval",
  published: "2026-11-11",
  updated: "2026-11-11",
  body,
  related: ["uptime-percentage-explained", "cost-of-website-downtime", "why-is-my-website-down"],
  faqs: [
    {
      q: "Is a 5-minute uptime check interval good enough?",
      a: "For most business sites, yes. You'll notice an outage within 2.5 minutes on average. Online stores and APIs often justify 1-minute checks.",
    },
    {
      q: "Can an uptime monitor miss an outage?",
      a: "Yes. An outage that starts and ends between two checks is never seen. The shorter the outage compared with the interval, the more likely it is to be missed.",
    },
    {
      q: "How do monitors avoid false alarms?",
      a: "By retrying a failed check, confirming the failure from a second location, using sensible timeouts and alerting only after consecutive failures.",
    },
  ],
};
