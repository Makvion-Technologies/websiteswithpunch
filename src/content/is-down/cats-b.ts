import type { SiteCat } from "./sites";

export type CatCopy = {
  justYou: string;
  ifDown: string[];
  extra: string;
};

export const CAT_B: Partial<Record<SiteCat, CatCopy>> = {
  dev: {
    justYou: "Developer platforms often split the marketing site, the dashboard, Git or an API. GitHub's homepage can be up while pulls fail, and a cloud dashboard can load while deploys don't. Use the official status page for component-level detail.",
    ifDown: [
      "Note which part failed: the marketing site, the dashboard, Git, deploys or an API.",
      "Check the official status page for the specific component, not only whether the homepage loads.",
      "If your own site is down and it sits on this platform, check your project dashboard and recent deploys as well.",
      "Run this check again after a few minutes. Brief incidents are common on shared platforms.",
    ],
    extra: "This checker does not log in, call an API or inspect your project. A green result only means the public URL answered.",
  },
  india: {
    justYou: "In India, a site can fail on one ISP or in one city and work everywhere else, especially in the evening or during a sale, booking window or festival. Try mobile data if Wi-Fi fails, and don't assume a nationwide outage from one connection.",
    ifDown: [
      "Switch between Wi-Fi and mobile data, or try another device, to rule out a local or ISP issue.",
      "If you were booking, ordering or paying, check your history or email before trying the same payment again.",
      "Official apps sometimes keep working when the website is overloaded, and the other way round.",
      "For government portals, prefer the official app or a later retry over third-party 'agents' who offer to log in for you.",
    ],
    extra: "Peak traffic on rail bookings, tax filings, sales and live sports can make a site slow without taking it fully offline. A long response time is a clue, not a complete outage report.",
  },
  streaming: {
    justYou: "Streaming sites often load the homepage while playback, live events or sign-in fail. The app, the TV app and the website can also disagree. Start with your connection and the official app before assuming a company-wide outage.",
    ifDown: [
      "Confirm your own internet works by opening another site or speed test.",
      "Try the official app on another device, or the website if the app stalls.",
      "Sign out and back in only once; a stuck session is a common 'nothing will play' cause.",
      "If only one title or live event fails, the rest of the service may still be up.",
    ],
    extra: "We only request the public website. We can't see whether a particular show, live match or download is available in your region.",
  },
  commerce: {
    justYou: "Shops can keep the homepage up while search, cart or checkout fail, which is usually where it matters. During a sale the site may be slow rather than down. Don't place the same order twice until you can see whether the first one went through.",
    ifDown: [
      "Check your account's orders or email for a confirmation before paying again.",
      "Try the official app if the website is slow, or a private browser window if the app is.",
      "If checkout fails after payment, look at the order page or your bank/UPI history before retrying.",
      "A long response time during a sale often means the site is overloaded, not that the shop has closed.",
    ],
    extra: "This check doesn't add anything to a cart or test payment. It only tells you whether the public site answered from our server.",
  },
  work: {
    justYou: "Work tools often fail in pieces: chat is up while video isn't, or the website loads while sign-in is stuck. Your company may also block the site on the office network. Try a personal hotspot before you tell the whole team it's down.",
    ifDown: [
      "See whether sign-in, the main app and the meeting or file feature fail together or separately.",
      "Try a personal network if you're on an office or school connection that may filter the site.",
      "Check the official status page if the company publishes one — it usually names the component.",
      "If only your workspace or tenant is affected, the public homepage can still be fine.",
    ],
    extra: "A public homepage check can't see your tenant, SSO or a private meeting room.",
  },
  news: {
    justYou: "News and reference sites sometimes fail under a big breaking story, or only in one region because of a CDN issue. An ad blocker, a privacy extension or a strict browser can also make the page look blank when the site itself is up.",
    ifDown: [
      "Try a private window with extensions off, in case a blocker is hiding the page.",
      "Open the site on another network to rule out DNS or ISP filtering.",
      "If a particular article fails but the homepage loads, the site is up and that page may be the problem.",
      "Wait a minute and check again when a major story is breaking; brief overload is common.",
    ],
    extra: "This is a reachability check, not a feed of reports. We don't invent reader counts or an outage map.",
  },
};
