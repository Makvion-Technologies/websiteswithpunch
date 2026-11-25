import type { ArticleSection, Faq } from "@/components/seo/types";
import { byCadence } from "@/lib/monitor/config";
import { CHANNEL_LIMIT, planWord } from "@/lib/features/limits";

export const alertsFeature = {
  path: "/website-alerts",
  title: "Website Alerts – Email, Slack, Discord & Telegram",
  description:
    "Get an email when a site goes down or an SSL certificate or domain is near expiry, and send the same alerts to Slack, Discord, Telegram or a signed webhook. From $5/month, 30-day free trial.",
  eyebrow: "Website alerts",
  h1: "Hear about a down site, or a lapsed cert, where you already work",
  intro:
    "Websites With Punch emails you when a check finds a site down and again when it recovers, and 30, 7 and 1 day before an SSL certificate or domain expires. The same alerts can also go to Slack, Discord, Telegram or a signed webhook, with the events and sites you choose.",
  facts: [
    "Email alerts on every plan",
    "Slack, Discord, Telegram or a webhook",
    "Down, recovered, SSL and domain events",
    `${CHANNEL_LIMIT.starter} channels on Starter, ${CHANNEL_LIMIT.pro} on Pro, ${CHANNEL_LIMIT.business} on Business`,
  ],
  sections: [
    {
      h: "What we send",
      p: [
        byCadence(
          "When a background uptime check finds a site down, we confirm the failure from a second location and email you once. When the site is up again, we email you once more. For SSL certificates and domains we email at 30, 7 and 1 day before expiry, when the date has passed, and if a certificate is no longer trusted by browsers.",
          "When a daily check or a Recheck you run finds a site down, we email you once, and once more when it recovers. For SSL certificates and domains we email at 30, 7 and 1 day before expiry, when the date has passed, and if a certificate is no longer trusted by browsers. Checks aren't minute-by-minute, so alerts aren't real-time.",
        ),
        "Each event is sent once. You can switch email types off under Alerts & integrations, and every alert email has a one-click unsubscribe.",
      ],
    },
    {
      h: "Email, plus the tools your team already uses",
      p: [
        "Email is always included and doesn't count towards your channel limit. On top of that you can connect Slack, Discord, Telegram or a signed webhook. For each channel you pick a name, the events it should get, and whether it covers every site or only some of them. Send a test message before you rely on it, and pause or remove a channel at any time.",
        `Starter includes ${planWord(CHANNEL_LIMIT.starter, "channel")}, Pro ${CHANNEL_LIMIT.pro} and Business ${CHANNEL_LIMIT.business}. A channel is one Slack hook, one Discord hook, one Telegram chat or one webhook URL.`,
      ],
    },
    {
      h: "What we don't send",
      p: [
        "There are no SMS or phone-call alerts. We don't page an on-call rota, and a second location is only used to confirm a failure, not as full multi-region monitoring. If you need those, an incident tool is a better fit. If you want a quiet, honest watch on the sites you look after, with alerts in the places you already read, this is built for that.",
      ],
    },
  ] satisfies ArticleSection[],
  faqs: [
    {
      q: "Which alert channels can I use?",
      a: `Email is always on. You can also connect Slack, Discord, Telegram or a signed webhook. Starter includes ${CHANNEL_LIMIT.starter} of those channels, Pro ${CHANNEL_LIMIT.pro} and Business ${CHANNEL_LIMIT.business}.`,
    },
    {
      q: "Do you send SMS or phone calls?",
      a: "No. Alerts go by email and to the chat or webhook channels you connect.",
    },
    {
      q: "How quickly will I hear that a site is down?",
      a: byCadence(
        "Usually within a few minutes of a confirmed check (about a minute on paid plans, after a retry and a second-location confirmation). We email once when it goes down, and once when it's back.",
        "After our daily background check or a Recheck you run. Checks aren't minute-by-minute, so alerts aren't real-time.",
      ),
    },
    {
      q: "Can I choose which sites a Slack channel gets?",
      a: "Yes. Each channel can cover every site, or only the sites you pick, and you choose which events it receives.",
    },
    {
      q: "Are alerts included on every plan?",
      a: "Yes. Email alerts, the weekly report, the expiry calendar and badges are on every plan. The number of Slack, Discord, Telegram and webhook channels is what changes.",
    },
  ] satisfies Faq[],
};
