import type { ArticleSection, Faq } from "@/components/seo/types";
import { STATUS_PAGE_LIMIT, planWord } from "@/lib/features/limits";

export const statusPagesFeature = {
  path: "/status-pages",
  title: "Public Status Pages for the Sites You Watch",
  description:
    "Publish a public status page at websiteswithpunch.com/status/your-name, with current status and 90 days of daily uptime. Starter includes 1 page, Pro 5, Business 20. From $5/month, 30-day free trial.",
  eyebrow: "Status pages",
  h1: "A public status page for your clients, on a separate URL",
  intro:
    "Pick the sites to show and publish a page at websiteswithpunch.com/status/your-name. It shows overall status, each site's current state and 90 days of daily uptime bars, and it works in light and dark mode and on phones. Unpublish it whenever you like.",
  facts: [
    `${planWord(STATUS_PAGE_LIMIT.starter, "status page")} on Starter, ${STATUS_PAGE_LIMIT.pro} on Pro, ${STATUS_PAGE_LIMIT.business} on Business`,
    "Current status and 90-day daily uptime",
    "A separate URL from your own site",
    "Light and dark, and it fits a phone",
  ],
  sections: [
    {
      h: "What the page shows",
      p: [
        "The page opens with an overall banner: all systems operational, some systems having problems, or a major outage. Under that, each site you included has its current status, its hostname, and a row of daily uptime bars for the last 90 days (30 days on a phone). Grey means we didn't store a check that day.",
        "The page is public once you publish it, and it lives on our site, not yours, so it can still load when the site it's reporting on is down. It is cached for a short time so a rush of visitors during an outage doesn't hit the database on every request.",
      ],
    },
    {
      h: "How to publish one",
      p: [
        "In the dashboard, open Status pages, give the page a title and a short address (for example studio-sites), pick the sites to include, and publish. The public URL is websiteswithpunch.com/status/ followed by that address. You can unpublish or edit the page at any time. Starter includes 1 status page, Pro 5 and Business 20, with up to 50 sites on each page.",
      ],
    },
    {
      h: "What it doesn't do yet",
      p: [
        "Custom domains (status.yourdomain.com) are not supported yet. There is no incident-update composer, no subscriber list and no scheduled-maintenance calendar on the page. The page reports what our checks already know: whether each site is up, and how it has been over 90 days.",
        "If you need to post written incident updates, the templates in our [guide to setting up a status page](/blog/status-page-guide) still help, on this page or on a tool that supports updates. When you want a simple, honest status URL for the sites we already monitor, this is built for that.",
      ],
    },
  ] satisfies ArticleSection[],
  faqs: [
    {
      q: "How many status pages do I get?",
      a: `Starter includes ${STATUS_PAGE_LIMIT.starter}, Pro ${STATUS_PAGE_LIMIT.pro} and Business ${STATUS_PAGE_LIMIT.business}. Each page can show up to 50 sites.`,
    },
    {
      q: "Can I use my own domain, like status.example.com?",
      a: "Not yet. Every page is at websiteswithpunch.com/status/your-name. Custom domains aren't supported.",
    },
    {
      q: "Will the status page stay up if my site is down?",
      a: "Yes. It is hosted on our site, not on the site it's reporting on, and it is cached so a burst of visitors during an outage is safe.",
    },
    {
      q: "Can I post incident updates on the page?",
      a: "Not yet. The page shows live status and 90-day uptime from our checks. For written updates, see our status page guide, which includes templates you can use elsewhere.",
    },
    {
      q: "Can I unpublish a page?",
      a: "Yes, at any time from the dashboard. The public URL then shows as not found until you publish it again.",
    },
  ] satisfies Faq[],
};
