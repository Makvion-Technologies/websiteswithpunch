export { faqs } from "./faq-content";


export const howSteps = [
  {
    step: "01",
    title: "Add your URL",
    body: "Paste the site you care about. Free covers one site; paid plans scale with you.",
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
    visual: "uptime",
  },
  {
    title: "SSL certificates",
    eyebrow: "Trust",
    body: "For HTTPS sites we read the certificate expiry date and show days remaining. Get ahead of browser trust warnings before customers see them and bounce.",
    visual: "ssl",
  },
  {
    title: "Domain expiry",
    eyebrow: "Ownership",
    body: "Best-effort RDAP/WHOIS lookups surface when your root domain is due for renewal. A lapsed domain takes the site and often email offline — catch that early.",
    visual: "domain",
  },
] as const;

export const proofMetrics = [
  { label: "Uptime", detail: "Scheduled HTTP checks" },
  { label: "SSL", detail: "Days until expiry" },
  { label: "Domain", detail: "Renewal window" },
  { label: "Alerts & status", detail: "Slack, Discord, Telegram, status pages" },
];
