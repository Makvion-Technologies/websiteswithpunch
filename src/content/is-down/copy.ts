import type { ArticleSection, Faq } from "@/components/seo/types";
import { CAT_A, type CatCopy } from "./cats-a";
import { CAT_B } from "./cats-b";
import type { DownSite } from "./index";
import type { SiteCat } from "./sites";
import { byCadence, UPTIME_EVERY } from "@/lib/monitor/config";

const CAT = { ...CAT_A, ...CAT_B } as Record<SiteCat, CatCopy>;

/** Title stays at or under 60 characters; longer names drop the second mention. */
function siteTitle(name: string): string {
  const full = `Is ${name} Down Right Now? Live ${name} Status Check`;
  return full.length <= 60 ? full : `Is ${name} Down Right Now? Live Status Check`;
}

/** Pick the longest description that still sits between 140 and 155 characters. */
function siteDescription(name: string, host: string): string {
  const variants = [
    `Is ${name} (${host}) down right now, or is it just you? We request it from our server and show the HTTP status and response time. Free, no account needed.`,
    `Is ${name} (${host}) down right now, or is it just you? Check live from our server for HTTP status and response time. Free, no account needed.`,
    `Is ${name} (${host}) down right now, or is it just you? Check live from our server — HTTP status and response time. Free, no signup.`,
    `Is ${name} (${host}) down right now, or just you? We check it from our server and show HTTP status and response time. Free, no signup.`,
    `Is ${name} (${host}) down right now, or is it just you? Live HTTP status and response time from our server. Free, no signup.`,
    `Is ${name} (${host}) down right now, or just you? Check live from our server — HTTP status and response time. Free, no signup.`,
    `Is ${name} (${host}) down right now, or just you? Live check from our server: HTTP status and response time. Free, no signup.`,
    `Is ${name} (${host}) down right now, or just you? Live HTTP status and response time from our server. Free, no signup.`,
    `Is ${name} (${host}) down right now, or is it just you? Live HTTP status and response time, free, no signup.`,
    `Is ${name} (${host}) down right now? We request it from our server and show HTTP status and response time. Free, no signup.`,
    `Is ${name} (${host}) down right now? Check live from our server — HTTP status and response time. Free, no signup.`,
    `Is ${name} (${host}) down right now? Live check from our server for HTTP status and response time. Free, no signup.`,
    `Is ${name} (${host}) down right now, or is it just you? Check live: HTTP status and response time. Free, no signup.`,
  ];
  const fit = variants.filter((d) => d.length >= 140 && d.length <= 155);
  if (!fit.length) {
    throw new Error(`No 140–155 character description for ${name} (${host})`);
  }
  return fit.reduce((best, d) => (d.length > best.length ? d : best));
}

/** Unique-enough copy for one site, built from its name, host and category. No invented outage data. */
export function siteCopy(site: DownSite) {
  const { name, host, cat, catLabel, statusUrl } = site;
  const c = CAT[cat];
  const statusLine = statusUrl
    ? `If ${name} publishes a status page, you can also read it at [${host} status](${statusUrl}). That's the company describing its own systems, which this checker cannot see inside.`
    : `Some companies publish an official status page. If ${name} has one, prefer that for component-level detail. We don't rely on unofficial outage trackers.`;
  const sections: ArticleSection[] = [
    {
      h: `Is ${name} down, or is it just you?`,
      p: [
        `This page requests ${host} from our server, not from your phone or office network. If we can load it and you can't, the problem is usually on your side: DNS, Wi-Fi, a VPN, a browser extension or a cached error. If we can't load it either, ${name} is likely failing for other people too. One location can't prove a worldwide outage, and we don't invent user reports or a live incident map.`,
        c.justYou,
      ],
    },
    {
      h: `What to try if ${name} looks down`,
      steps: c.ifDown,
      p: [c.extra, statusLine],
    },
    {
      h: "How this check works",
      p: [
        `We load the homepage of ${host} over HTTPS when you open this page, follow a few redirects, and show the HTTP status code and response time. 2xx and 3xx answers count as up. The result is cached for about a minute. You can run it again with Check again. For any other address, use the [website down checker](/tools/website-down-checker).`,
        `If you look after your own site, you can [monitor it ${byCadence("around the clock", "daily")} free for 30 days](/signup?plan=starter) — uptime, SSL and domain expiry on one dashboard, with email alerts when a check finds it down. Then $5/month for 10 sites.`,
      ],
    },
  ];
  const faqs: Faq[] = [
    {
      q: `How do I check if ${name} is down?`,
      a: `We request ${host} from our server when you open this page and show whether it answered, the status code and the response time. You can run it again with Check again. You don't need an account.`,
    },
    {
      q: `Why does ${name} work for me but show as down here, or the other way round?`,
      a: `Your app or browser may be using a cached page or an old DNS answer, or ${name} may block some data-centre traffic. Equally, the site can be reachable from our server and still blocked on your network or in the official app.`,
    },
    {
      q: `Does this show live user reports for ${name}?`,
      a: "No. We only show the result of one request from our server when you open this page. We don't publish visitor counts, outage maps or crowdsourced reports.",
    },
    {
      q: `Can I get an alert if my own site goes down, like this ${catLabel.toLowerCase()} check?`,
      a: byCadence(
        `Yes. Add your site to Websites With Punch and we check its uptime ${UPTIME_EVERY}, confirm a failure from a second location, and email you if it's down and again when it's back. SSL and domain expiry are checked daily. Free for one site, no card needed.`,
        "Yes. Add your site to Websites With Punch and we check it once a day, with on-demand rechecks and optional auto refresh while the dashboard is open. We email you if a check finds it down, and again when it's back. Free for one site, no card needed.",
      ),
    },
  ];
  return {
    title: siteTitle(name),
    description: siteDescription(name, host),
    h1: `Is ${name} down?`,
    intro: `Check whether ${name} is down for everyone or just for you. We'll request ${host} from our server and show the status code and response time. Free, no signup — and we don't invent live outage counts.`,
    sections,
    faqs,
    cta: `Want this kind of check on your own website, ${byCadence("every few minutes", "every day")}? Add it to Websites With Punch. We record uptime, SSL and domain expiry, and email you if a check finds it down. From $5/month for 10 sites, with a 30-day free trial.`,
  };
}
