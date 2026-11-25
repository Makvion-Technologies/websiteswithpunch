import { PLANS, SITE_PACKS } from "@/lib/plans";
import { byCadence, UPTIME_EVERY } from "@/lib/monitor/config";
import { HEARTBEATS, HEARTBEAT_LIMIT } from "@/lib/heartbeats/config";
import { CHANNEL_LIMIT, STATUS_PAGE_LIMIT } from "@/lib/features/limits";

/** Homepage FAQs (also used for FAQ JSON-LD). Only describe what is built. */
export const faqs = [
  {
    q: "What counts as one site?",
    a: "One site = one host. www and bare domains are the same (www.example.com and example.com). Paths like /topics are dropped — we monitor the whole origin. Other subdomains (blog.example.com, app.example.com) are separate sites.",
  },
  {
    q: "How often do checks run?",
    a: byCadence(
      `Uptime and response time are checked in the background ${UPTIME_EVERY}, and a failure is confirmed from a second location before it counts. SSL certificate expiry and domain expiry are checked once a day. Open a site to recheck it on demand (once a minute), or turn on auto refresh to recheck every 60 seconds while the page is open.`,
      "Every site is checked once a day in the background: uptime and response time, SSL certificate expiry and domain expiry. Open a site to recheck it on demand (once a minute), or turn on auto refresh to recheck every 60 seconds while the page is open.",
    ),
  },
  {
    q: "What’s free vs Pro vs Business?",
    a: `Free monitors ${PLANS.free.siteLimit} site. Pro covers up to ${PLANS.pro.siteLimit} sites. Business covers up to ${PLANS.business.siteLimit} sites. Pay monthly, or yearly for 2 months free; prices in USD are on the Pricing page. On Pro or Business, add optional site packs from the dashboard — they join your existing subscription.`,
  },
  {
    q: "What if I need more than 10 or 50 sites?",
    a: `On Pro, add optional +${SITE_PACKS.pro.sitesPerPack} site packs (up to ${PLANS.pro.siteLimit + SITE_PACKS.pro.maxPacks * SITE_PACKS.pro.sitesPerPack} sites), then upgrade to Business. On Business, add +${SITE_PACKS.business.sitesPerPack} packs (up to ${PLANS.business.siteLimit + SITE_PACKS.business.maxPacks * SITE_PACKS.business.sitesPerPack} sites). Packs join your existing subscription and bill the same way, monthly or yearly. When you add a pack, the unused part of your current period is credited, the new total is charged right away, and your billing date moves to that day. You can remove packs anytime, and the removal takes effect at your next renewal. You keep the additional capacity until the end of the period you've paid for. Need more than that? Send us a message from the Contact page for a custom limit.`,
  },
  ...(HEARTBEATS
    ? [
        {
          q: "Can you monitor cron jobs and scheduled tasks?",
          a: `Yes, with heartbeats. Each one gets a secret ping URL; add one curl or wget line to the end of your job and we expect a ping every 5 minutes, 15 minutes, hour, day or week, plus a grace time you choose. If a ping doesn't arrive in time we email you (and any alert channels you connected), and again when pings resume. We look for missed pings every minute. Free includes ${HEARTBEAT_LIMIT.free} heartbeat (hourly or slower), Pro ${HEARTBEAT_LIMIT.pro} and Business ${HEARTBEAT_LIMIT.business}.`,
        },
      ]
    : []),
  {
    q: "Can I give my customers a public status page?",
    a: `Yes. Pick the sites to show and publish a page at websiteswithpunch.com/status/your-name with current status and 90 days of daily uptime. It works in light and dark mode and on phones, and you can unpublish it anytime. Free includes ${STATUS_PAGE_LIMIT.free} status page, Pro ${STATUS_PAGE_LIMIT.pro} and Business ${STATUS_PAGE_LIMIT.business}. Custom domains aren't supported yet.`,
  },
  {
    q: "What's in the weekly report?",
    a: "An opt-in email once a week with each site's uptime, incidents, average response time and upcoming SSL and domain renewals. Turn it on under Weekly report in the dashboard, preview it first, and unsubscribe from any report with one click.",
  },
  {
    q: "Can I see every renewal date in one place?",
    a: "Yes. The expiry calendar lists every SSL certificate and domain renewal by month, flags the ones that are close, and gives you a private calendar feed (.ics) to add to Google Calendar, Outlook or Apple Calendar.",
  },
  {
    q: "Can I show uptime on my own site?",
    a: "Yes. Every site has an uptime badge and a status badge (SVG images). Copy the embed snippet from the site's Badge tab and paste it into your README or website.",
  },
  {
    q: "What exactly am I paying for?",
    a: "A subscription to our online website monitoring software (SaaS). There's nothing to install or ship: you sign in and use the dashboard in your browser, right after you sign up.",
  },
  {
    q: "Do I need a card to start?",
    a: "No. Create an account, add one URL, and use the free plan. Upgrade when you need more sites — secure checkout appears only when you’re ready to pay.",
  },
  {
    q: "How accurate is domain expiry?",
    a: "We use best-effort RDAP/WHOIS lookups. Most common TLDs work well; some registries are sparse or rate-limited. Treat it as an early warning, not a legal registrar notice.",
  },
  {
    q: "Do you send alerts?",
    a: byCadence(
      `Yes, by email, and also to Slack, Discord, Telegram or a signed webhook if you connect them (Free includes ${CHANNEL_LIMIT.free} channels, Pro ${CHANNEL_LIMIT.pro}, Business ${CHANNEL_LIMIT.business}). When a confirmed check finds a site down we email you once (and again when it recovers), usually within a few minutes, and we email 30, 7 and 1 day before an SSL certificate or domain expires. Choose which sites and events each channel gets, send a test message, and turn email alerts off under Alerts & integrations in your dashboard.`,
      `Yes, by email, and also to Slack, Discord, Telegram or a signed webhook if you connect them (Free includes ${CHANNEL_LIMIT.free} channels, Pro ${CHANNEL_LIMIT.pro}, Business ${CHANNEL_LIMIT.business}). When a check finds a site down we email you once (and again when it recovers), and we email 30, 7 and 1 day before an SSL certificate or domain expires. Checks run daily and whenever you press Recheck, so alerts aren't real-time. Choose which sites and events each channel gets, send a test message, and turn email alerts off under Alerts & integrations in your dashboard.`,
    ),
  },
  {
    q: "What happens to my sites if I downgrade or cancel?",
    a: "Nothing is deleted. Sites over your new limit are locked — they stay in your list but aren't checked, and their details stay hidden until you unlock them. You choose which sites stay active when the change is scheduled (or we keep your oldest if you cancel from the billing portal).",
  },
  {
    q: "Can I switch which site stays active?",
    a: "Before your plan changes, yes, as often as you like. After that, the active sites are fixed. To use a different one, delete an active site to free a slot, then add a new site or unlock a locked one.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. Paid plans renew automatically each month or year, depending on the billing period you choose. You can cancel from Your plan on the dashboard or through Manage billing. When you cancel, your current plan remains active until the end of the billing period you've already paid for. After that, your account moves to the Free plan. Nothing is deleted — sites beyond the Free plan limit are locked.",
  },
  {
    q: "Do you offer refunds?",
    a: "Payments are non-refundable, including after you cancel. When you cancel, downgrade, remove a site pack, or switch from annual to monthly billing, no refund or credit is provided for the remaining time in the current billing period. You keep your current plan and capacity until the end of the period you've paid for, and the change takes effect at renewal. Upgrades take effect immediately and are charged on a prorated basis, with unused time credited. The only exceptions (duplicate charges, billing errors, or a paid plan we couldn't provide) are set out in our Refund & Cancellation Policy, linked in the footer.",
  },
];
