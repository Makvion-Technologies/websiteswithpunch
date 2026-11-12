import type { ArticleSection, Faq } from "@/components/seo/types";
import { byCadence, UPTIME_EVERY } from "@/lib/monitor/config";

export const uptimeFeature = {
  path: "/uptime-monitoring",
  title: "Website Uptime Monitoring for Freelancers & Agencies",
  description:
    byCadence(
      "Website uptime monitoring every minute on Pro and Business, every 5 minutes on Free, with confirmed email alerts and 90 days of history. Free for one site.",
      "Website uptime monitoring with a daily check of every site, on-demand rechecks, auto refresh and 90 days of response-time history. Free for one site.",
    ),
  eyebrow: "Uptime monitoring",
  h1: "Website uptime monitoring without the noise",
  intro:
    byCadence(
      `Websites With Punch checks the uptime of each of your sites ${UPTIME_EVERY}, records whether it answered and how fast, and keeps the history on one calm dashboard. A failure is confirmed from a second location before we email you.`,
      "Websites With Punch checks each of your sites once a day in the background, records whether it answered and how fast, and keeps the history on one calm dashboard. When you need a fresh answer, recheck on demand or turn on auto refresh.",
    ),
  facts: [
    byCadence("Uptime every minute on Pro and Business, every 5 minutes on Free", "Daily background check of every site"),
    "Recheck on demand, once a minute per site",
    "Auto refresh every 60 s while a site page is open",
    "Up to 90 days of status and response-time history",
  ],
  sections: [
    {
      h: "What an uptime check does",
      p: [
        "An uptime check requests your site's homepage over HTTPS, follows up to five redirects, and records the HTTP status code and the total response time. Any 2xx or 3xx answer counts as up; a 4xx or 5xx answer counts as down; no answer at all (a DNS failure, a refused connection, a timeout or a certificate error) is recorded as an error with the reason in plain English.",
        "Every request goes through the same safety checks as our free website down checker: public addresses only, a limited set of ports, and each redirect validated before we follow it.",
      ],
    },
    {
      h: "How often sites are checked, honestly",
      p: [
        byCadence(
          `Uptime runs in the background ${UPTIME_EVERY}. When a check fails, it is retried and then confirmed from a second location before anything is recorded as an outage or emailed, so one dropped request doesn't wake you up. SSL certificate and domain expiry don't change minute to minute, so those are looked up once a day.`,
          "Every active site gets one scheduled check a day, together with its SSL certificate and domain expiry lookup. That's enough to catch the slow failures (a site that broke after an update, a host that quietly went away, a certificate or domain about to lapse) and to build a useful history without hammering anyone's server.",
        ),
        byCadence(
          "You can still press Recheck on a site's page for a fresh result right away (once a minute per site), or switch on auto refresh to rerun the check every 60 seconds while the page stays open, which is handy while you're fixing an outage or watching a deploy. When a confirmed check finds the site down we email you once, and once more when it's back up.",
          "When you want more than that, open a site's page and press Recheck for a fresh result right away (once a minute per site), or switch on auto refresh to rerun the check every 60 seconds while the page stays open, which is handy while you're fixing an outage or watching a deploy. We don't run minute-by-minute checks around the clock. When a check finds the site down we email you once, and once more when it's back up.",
        ),
      ],
    },
    {
      h: "What you see on the dashboard",
      list: [
        "Up, down or error status for every site in one list, with the time of the last check.",
        "Response-time charts for the last 24 hours, 7 days, 30 days or the whole retained history (up to 90 days).",
        "Uptime percentage, average latency and the last downtime for the selected range.",
        "A Health Score per site that combines uptime, SSL days left and domain days left.",
        "SSL and domain days left on the same card, so the three most common causes of a dead site sit side by side.",
      ],
    },
    {
      h: "Who it's for",
      p: [
        `Freelancers and small agencies who look after a handful of client sites, owners of a business site or online shop, and developers with side projects. If you need 30-second checks from a dozen regions, phone-call escalation or a public status page, a dedicated incident tool is a better fit. ${byCadence("If you want a quiet, steady watch on", "If you want a quiet daily look at")} whether your sites are up, fast and not about to expire, this is built for that.`,
      ],
    },
  ] satisfies ArticleSection[],
  faqs: [
    {
      q: "How often does Websites With Punch check uptime?",
      a: byCadence(
        `Uptime is checked in the background ${UPTIME_EVERY}, plus any time you press Recheck (once a minute per site) and every 60 seconds while auto refresh is on and the site's page is open. SSL and domain expiry are looked up once a day.`,
        "Once a day in the background for every active site, plus any time you press Recheck (once a minute per site) and every 60 seconds while auto refresh is on and the site's page is open.",
      ),
    },
    {
      q: "Will I get an alert when my site goes down?",
      a: byCadence(
        "Yes, by email. When a background check finds the site down and a second location confirms it, we email you once, and again once it recovers, usually within a few minutes (about a minute on Pro and Business). We don't send SMS or chat alerts. You can switch alerts off on your profile.",
        "Yes, by email. When our daily check (or a Recheck you run) finds the site down, we email you once, and again once it recovers. Checks aren't minute-by-minute, so alerts aren't real-time, and we don't send SMS or chat alerts. You can switch alerts off on your profile.",
      ),
    },
    {
      q: "What counts as down?",
      a: "An HTTP status of 400 or above is recorded as down. No answer at all, such as a DNS failure, timeout, refused connection or certificate error, is recorded as an error with the reason.",
    },
    {
      q: "How much history is kept?",
      a: "Up to 90 days of checks per site. Charts can show the last 24 hours, 7 days, 30 days or all retained history.",
    },
    {
      q: "Is uptime monitoring free?",
      a: "The free plan monitors one site with uptime, SSL and domain checks. Pro covers up to 10 sites and Business up to 50, billed monthly or yearly.",
    },
  ] satisfies Faq[],
};
