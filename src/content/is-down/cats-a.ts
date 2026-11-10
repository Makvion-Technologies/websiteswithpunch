import type { SiteCat } from "./sites";

export type CatCopy = {
  justYou: string;
  ifDown: string[];
  extra: string;
};

export const CAT_A: Partial<Record<SiteCat, CatCopy>> = {
  social: {
    justYou: "Social apps often look down when the website is fine, or the other way round. A stuck app cache, an expired session or a flaky mobile network is more common than a full outage. Try the site in a browser on another network, or the app after a force-close, before assuming everyone else is locked out too.",
    ifDown: [
      "Open the site on another device or network, such as mobile data instead of Wi-Fi, to rule out a local fault.",
      "Force-close the app, or try a private browser window, so a stale login or cached page isn't in the way.",
      "If the company publishes a status page, check that as well — it's the most direct description of their own systems.",
      "Wait a few minutes and check again. Brief incidents on busy networks often clear without anything you can do.",
    ],
    extra: "Feeds, stories, calls and payments inside the same app can fail separately. A failed image or a laggy inbox is not the same as the sign-in page being unreachable.",
  },
  google: {
    justYou: "Google's products share a sign-in layer, so a problem with accounts can look like Gmail, Drive or Meet is down when the product itself is fine. Workspace customers also have an admin status dashboard that is more specific than a single homepage check.",
    ifDown: [
      "See whether you can open other Google products with the same account. If they all fail, the issue may be sign-in rather than this one service.",
      "Try a private window or a different browser, in case an extension or a stale cookie is blocking the page.",
      "Check Google's Workspace Status Dashboard if you use a work or school account.",
      "If only one document, meeting or mailbox fails, the rest of the service may still be up.",
    ],
    extra: "A green result here means the public page answered from our server. It does not test your mailbox, a private file or a Meet call.",
  },
  ai: {
    justYou: "AI tools often slow down or return errors when a lot of people are using them, even while the marketing site still loads. A timeout or a queue is not always a full outage. Retry once, and check the company's status page if they publish one.",
    ifDown: [
      "Reload once or start a new chat. Overloaded models often recover without a full incident.",
      "If you pay for a plan, try signing out and back in; a stuck session can look like an outage.",
      "Check the official status page, if there is one, rather than screenshots on social media.",
      "If the homepage loads but answers don't, the site is up and the model or API behind it may be the part that's struggling.",
    ],
    extra: "This checker only loads the public website. It cannot tell you whether a particular model, image job or API key is working.",
  },
  payments: {
    justYou: "Payment sites are designed to fail closed. A checkout that hangs, a transfer that stays pending or an app that won't open can be a planned window, a card-network issue or a problem on your device. Don't send the same payment again until you can see whether the first one went through.",
    ifDown: [
      "Don't retry a payment, payout or top-up until you can confirm the first attempt in your history.",
      "Try the official app and the website separately; one sometimes works when the other doesn't.",
      "If you were mid-checkout on another site, check that site's order page before paying twice.",
      "Use the company's official status page or in-app help, not a random text or call asking you to 'verify' the payment.",
    ],
    extra: "We will never ask for card numbers, OTPs or login details. If a check fails, treat it as a reachability result, not a statement about your balance.",
  },
  banks: {
    justYou: "Banking sites often have scheduled maintenance late at night, and the mobile app can stay up when the website is down. A timeout after you typed your password is not always a completed login. Never share an OTP, PIN or password with anyone who contacts you about an 'outage'.",
    ifDown: [
      "Try the official mobile app if the website stalls, or the website if the app does.",
      "Avoid repeating a transfer or bill payment until it shows in your history or you can speak to the bank.",
      "If you were mid-login, wait and sign in once more later rather than hammering the button.",
      "Ignore texts, emails or calls that ask you to 'restore access' through a link. Real banks don't reset access that way.",
    ],
    extra: "This tool only checks whether the public site answers. It cannot see your accounts, and it is not a substitute for the bank's own channels.",
  },
  gaming: {
    justYou: "A store page can load while game servers, a launcher or voice chat are down. Regional issues and busy launch nights are also common. Check the launcher or the game's own server status if the website looks fine.",
    ifDown: [
      "See whether the launcher, the store and the game itself fail, or only one of them.",
      "Restart the launcher and check that the system clock is correct; expired tokens cause a lot of 'can't connect' errors.",
      "If the company posts server status, use that for playability — this page only tests the website.",
      "On a sale or launch day, retries may just add to a queue. Give it a few minutes.",
    ],
    extra: "A successful website check does not mean matchmaking, downloads or logins to the game are working.",
  },
};
