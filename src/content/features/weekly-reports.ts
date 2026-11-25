import type { ArticleSection, Faq } from "@/components/seo/types";

export const weeklyReportsFeature = {
  path: "/weekly-reports",
  title: "Weekly Uptime Report – Email Summary for Every Site",
  description:
    "An opt-in weekly email with each site's uptime, incidents, average response time and SSL or domain renewals due in 30 days. On every plan. Preview it first. From $5/month, 30-day free trial.",
  eyebrow: "Weekly reports",
  h1: "A weekly email with the week's uptime, in one place",
  intro:
    "Turn on the weekly report in your dashboard and we'll email you once a week with each site's uptime, incidents, downtime and average response time, plus SSL certificates and domains due in the next 30 days. Preview the email first, and unsubscribe with one click.",
  facts: [
    "On every plan",
    "Uptime, incidents and response time",
    "SSL and domain renewals due in 30 days",
    "Preview it, then opt in",
  ],
  sections: [
    {
      h: "What's in the email",
      p: [
        "The report covers the last seven days, in UTC. At the top you get overall uptime, how many incidents there were, and how many SSL certificates or domains expire in the next 30 days. Then a row for each site: uptime percentage, incident count, total downtime and average response time, with the quieter sites first so a problem is easy to see.",
        "Renewals due in 30 days are listed under that, so a certificate or domain that needs attention isn't buried in a dashboard you didn't open that week.",
      ],
    },
    {
      h: "Opt in, preview, unsubscribe",
      p: [
        "The report is off until you turn it on under Weekly report in the dashboard. You can preview the current week's email before you subscribe (twice a day). Every report includes a link to stop weekly reports, and the same unsubscribe page can turn off alert emails too.",
        "The weekly report is included on every plan. It is a summary of what we already measured, not a separate monitoring product.",
      ],
    },
  ] satisfies ArticleSection[],
  faqs: [
    {
      q: "Is the weekly report on every plan?",
      a: "Yes. It is opt-in, and it is included on Starter, Pro, Business and Custom.",
    },
    {
      q: "When is it sent?",
      a: "Once a week, on a day spread out so everyone isn't emailed at once. The dashboard shows the next send date after you turn it on.",
    },
    {
      q: "Can I see the email before I subscribe?",
      a: "Yes. Preview it from Weekly report in the dashboard, up to twice a day.",
    },
    {
      q: "How do I stop it?",
      a: "Turn it off on the Weekly report page, or use the unsubscribe link in any report.",
    },
  ] satisfies Faq[],
};
