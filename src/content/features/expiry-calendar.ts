import type { ArticleSection, Faq } from "@/components/seo/types";

export const expiryCalendarFeature = {
  path: "/expiry-calendar",
  title: "SSL & Domain Expiry Calendar – Agenda and ICS Feed",
  description:
    "See every SSL certificate and domain renewal on one calendar, and subscribe to a private .ics feed in Google Calendar, Outlook or Apple Calendar. On every plan. From $5/month, 30-day free trial.",
  eyebrow: "Expiry calendar",
  h1: "Every renewal date, on one calendar you can subscribe to",
  intro:
    "The expiry calendar in your dashboard lists every SSL certificate and domain renewal across your sites, by month, and flags the ones that are close. You can also subscribe to a private calendar feed and see those dates in Google Calendar, Outlook or Apple Calendar.",
  facts: [
    "On every plan",
    "SSL and domain dates on one agenda",
    "Amber at 30 days, red at 7",
    "Private .ics feed, with a 7-day reminder",
  ],
  sections: [
    {
      h: "The agenda in your dashboard",
      p: [
        "Open Expiry calendar to see the next 12 months. A month strip shows how many renewals fall in each month, coloured by the most urgent one. Under that, each date has the site name, whether it is an SSL certificate or a domain, and how many days are left. Days already passed sit in the current month so nothing overdue is hidden.",
        "The dates come from the same daily lookups as [SSL certificate monitoring](/ssl-certificate-monitoring) and [domain expiry monitoring](/domain-expiry-monitoring): the live certificate on port 443, and a best-effort RDAP lookup (with a WHOIS fallback) for the registrable domain. Some country-code registries don't publish an expiry date, so treat those as an early warning, not a registrar notice.",
      ],
    },
    {
      h: "Add it to the calendar you already use",
      p: [
        "Each account gets a private calendar address (an .ics feed). Paste it into Google Calendar, Outlook or Apple Calendar and the renewal dates appear as all-day events, with a 7-day reminder. The feed refreshes about every 12 hours. The address is a signed key: anyone who has it can read your renewal dates, and nothing else, so keep it like a secret calendar URL.",
        "The expiry calendar and the feed are included on every plan.",
      ],
    },
  ] satisfies ArticleSection[],
  faqs: [
    {
      q: "Is the expiry calendar on every plan?",
      a: "Yes. The agenda and the private calendar feed are included on Starter, Pro, Business and Custom.",
    },
    {
      q: "Which calendars can I subscribe with?",
      a: "Any calendar that accepts an iCalendar (.ics) URL, including Google Calendar, Outlook and Apple Calendar.",
    },
    {
      q: "How accurate are domain dates?",
      a: "We look them up daily over RDAP, with a WHOIS fallback. Most common TLDs work well; some registries are sparse or rate-limited. Treat the date as an early warning, not a legal registrar notice.",
    },
    {
      q: "Is the calendar feed public?",
      a: "No. It uses a signed address, like a secret calendar URL. Anyone with the address can see your renewal dates, so don't post it publicly.",
    },
  ] satisfies Faq[],
};
