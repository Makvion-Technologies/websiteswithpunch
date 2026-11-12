import type { BlogPost } from "../types";
import body from "./website-maintenance-without-hurting-seo.md";

export const post: BlogPost = {
  slug: "website-maintenance-without-hurting-seo",
  title: "Website Maintenance Without Hurting SEO: Use a 503",
  h1: "Website maintenance without hurting SEO: 503, Retry-After and a checklist",
  description:
    "Take a site down for maintenance the way Google recommends: a 503 with Retry-After, robots.txt left alone, ready-made Nginx, Apache and Next.js configs.",
  category: "fixes",
  query: "website maintenance mode seo 503",
  published: "2026-11-11",
  updated: "2026-11-11",
  body,
  related: ["fix-502-503-504-errors", "status-page-guide", "uptime-percentage-explained"],
  faqs: [
    {
      q: "What status code should a maintenance page return?",
      a: "503 Service Unavailable, with a Retry-After header. Google treats it as temporary and keeps your pages indexed.",
    },
    {
      q: "How long can a site return 503 before SEO suffers?",
      a: "Google advises no more than a day or two. If the same URLs return 503 for several days they may be dropped from the index; for longer closures, serve an indexable 200 placeholder.",
    },
    {
      q: "Should I block crawlers in robots.txt during maintenance?",
      a: "No. Keep robots.txt reachable and unchanged. Returning 503 for robots.txt blocks all crawling, and disallowing everything can remove content from search.",
    },
  ],
};
