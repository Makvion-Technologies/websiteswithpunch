import type { ArticleSection, Faq } from "@/components/seo/types";

export const uptimeBadgesFeature = {
  path: "/uptime-badges",
  title: "Uptime Badges – Embed Status on Your Site or README",
  description:
    "Embed a 30-day uptime badge or a current status badge on your site or README. SVG images, with Markdown and HTML snippets, refreshed every 5 minutes. On every plan. From $5/month, 30-day free trial.",
  eyebrow: "Uptime badges",
  h1: "Show uptime on your site, with a live badge",
  intro:
    "Every monitored site gets two SVG badges: 30-day uptime and current status. Copy the Markdown or HTML snippet from the site's Badge tab and paste it into a README, a footer or a client report. The images refresh every 5 minutes.",
  facts: [
    "On every plan",
    "30-day uptime and current status",
    "Markdown and HTML snippets",
    "Refreshes every 5 minutes",
  ],
  sections: [
    {
      h: "The two badges",
      p: [
        "The uptime badge shows the share of checks that passed over the last 30 days (for example 99.9%). The status badge shows whether the site is up or down right now. Both are small, flat SVG images with the Websites With Punch blue on the label, and green, amber or red on the value.",
        "Open a site in the dashboard, go to the Badge tab, and copy the Markdown or HTML. The Markdown form is ready for a GitHub README; the HTML form is an image inside a link to your site.",
      ],
    },
    {
      h: "How the address works",
      p: [
        "Each badge URL is a signed key for that one site. Someone who has the URL can see that site's uptime or status, and nothing else — not your other sites, and not your account. The image is cached for 5 minutes, so a popular README doesn't request a fresh number on every page view.",
        "Badges are included on every plan. They are a small embed, not a [public status page](/status-pages): if you want overall status and 90-day bars for several sites, publish a status page instead.",
      ],
    },
  ] satisfies ArticleSection[],
  faqs: [
    {
      q: "Are uptime badges on every plan?",
      a: "Yes. Every monitored site has both badges on Starter, Pro, Business and Custom.",
    },
    {
      q: "How often does a badge update?",
      a: "The image is cached for 5 minutes. After that, the next request gets a fresh 30-day uptime or current status.",
    },
    {
      q: "Is the badge URL secret?",
      a: "It is a signed address for one site. Anyone with the URL can see that site's badge, so only post it where you are happy for the uptime or status to be public.",
    },
    {
      q: "Is a badge the same as a status page?",
      a: "No. A badge is a small image for one site. A status page is a full public page for one or more sites, with 90-day uptime bars.",
    },
  ] satisfies Faq[],
};
