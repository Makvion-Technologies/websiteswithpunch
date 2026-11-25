import { byCadence } from "@/lib/monitor/config";

export { faqs } from "./faq-content";

export const howSteps = [
  {
    step: "01",
    title: "Add your URL",
    body: "Paste the site you care about. Starter covers 10 sites, and bigger plans scale with you.",
  },
  {
    step: "02",
    title: "We check it",
    body: "Scheduled HTTP(S) checks, SSL expiry reads, and domain lookups run in the background.",
  },
  {
    step: "03",
    title: "Get told, then share it",
    body: "Alerts reach email, Slack, Discord, Telegram or a webhook. Publish a status page and get a weekly report.",
  },
];

export const monitorRows = [
  {
    title: "Uptime",
    eyebrow: "Availability",
    body: "We hit your URL on a schedule and record whether it responded. See up/down status, recent history, and response latency so you know when something broke — and how long it took to recover.",
    href: "/uptime-monitoring",
    link: "Read about uptime monitoring",
    visual: "uptime",
  },
  {
    title: "SSL certificates",
    eyebrow: "Trust",
    body: "For HTTPS sites we read the certificate expiry date and show days remaining. Get ahead of browser trust warnings before customers see them and bounce.",
    href: "/ssl-certificate-monitoring",
    link: "Read about SSL monitoring",
    visual: "ssl",
  },
  {
    title: "Domain expiry",
    eyebrow: "Ownership",
    body: "Best-effort RDAP/WHOIS lookups surface when your root domain is due for renewal. A lapsed domain takes the site and often email offline — catch that early.",
    href: "/domain-expiry-monitoring",
    link: "Read about domain expiry monitoring",
    visual: "domain",
  },
] as const;

export const proofMetrics = [
  { label: "Uptime", detail: byCadence("Checked every minute on paid plans", "Checked once a day") },
  { label: "SSL & domain", detail: "Expiry dates, checked daily" },
  { label: "Alerts", detail: "Email, Slack, Discord, Telegram, webhook" },
  { label: "Share", detail: "Status pages, badges and a weekly report" },
];
