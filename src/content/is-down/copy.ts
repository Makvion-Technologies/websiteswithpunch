import type { ArticleSection, Faq } from "@/components/seo/types";
import { CAT_A, type CatCopy } from "./cats-a";
import { CAT_B } from "./cats-b";
import type { DownSite } from "./index";
import type { SiteCat } from "./sites";

const CAT = { ...CAT_A, ...CAT_B } as Record<SiteCat, CatCopy>;

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
        `Press Check now and we load the homepage of ${host} over HTTPS, follow a few redirects, and show the HTTP status code and response time. 2xx and 3xx answers count as up. The result is cached for about a minute. For any other address, use the [website down checker](/tools/website-down-checker).`,
        `If you look after your own site, you can [monitor it daily for free](/signup) — uptime, SSL and domain expiry on one dashboard, with email alerts when a check finds it down. No card needed for one site.`,
      ],
    },
  ];
  const faqs: Faq[] = [
    {
      q: `How do I check if ${name} is down?`,
      a: `Press Check now above. We request ${host} from our server and show whether it answered, the status code and the response time. You don't need an account.`,
    },
    {
      q: `Why does ${name} work for me but show as down here, or the other way round?`,
      a: `Your app or browser may be using a cached page or an old DNS answer, or ${name} may block some data-centre traffic. Equally, the site can be reachable from our server and still blocked on your network or in the official app.`,
    },
    {
      q: `Does this show live user reports for ${name}?`,
      a: "No. We only show the result of one request from our server when you press the button. We don't publish visitor counts, outage maps or crowdsourced reports.",
    },
    {
      q: `Can I get an alert if my own site goes down, like this ${catLabel.toLowerCase()} check?`,
      a: "Yes. Add your site to Websites With Punch and we check it once a day, with on-demand rechecks and optional auto refresh while the dashboard is open. We email you if a check finds it down, and again when it's back. Free for one site, no card needed.",
    },
  ];
  return {
    title: `Is ${name} down right now? Live status check`,
    description: `Is ${name} (${host}) down right now, or is it just you? Check live from our server — HTTP status and response time, free, no signup. No invented outage reports.`,
    h1: `Is ${name} down?`,
    intro: `Check whether ${name} is down for everyone or just for you. We'll request ${host} from our server and show the status code and response time. Free, no signup — and we don't invent live outage counts.`,
    sections,
    faqs,
    cta: `Want this kind of check on your own website, every day? Add it to Websites With Punch. We record uptime, SSL and domain expiry, and email you if a check finds it down. Free for one site, no card needed.`,
  };
}
