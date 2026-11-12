import type { BlogPost } from "../types";
import body from "./why-is-my-website-down.md";

export const post: BlogPost = {
  slug: "why-is-my-website-down",
  title: "Why Is My Website Down? 10 Common Causes and Fixes",
  h1: "Why is my website down? 10 common causes and how to fix each",
  description:
    "A layer-by-layer way to find out why a website is down: DNS, expired domains and SSL certificates, server errors, firewalls and redirect loops, with fixes.",
  category: "fixes",
  query: "why is my website down",
  published: "2026-11-11",
  updated: "2026-11-11",
  body,
  related: ["fix-502-503-504-errors", "ssl-certificate-expired", "err-too-many-redirects"],
  faqs: [
    {
      q: "How do I know if my website is down for everyone or just me?",
      a: "Check it from somewhere other than your own network: an online down checker, or your phone on mobile data. If it loads there, the problem is your connection, VPN or DNS cache.",
    },
    {
      q: "Why does my website work on my phone but not on my computer?",
      a: "Usually a cached DNS answer, a browser cache, a VPN or a firewall on the computer. Flush the DNS cache, try a private window and turn off the VPN.",
    },
    {
      q: "Can an expired domain take my website down?",
      a: "Yes. When a domain expires the registrar usually stops its DNS from resolving, so the website and the email on that domain stop working until it's renewed.",
    },
    {
      q: "What should I check first when my site is down?",
      a: "Go in layer order: does the domain resolve (DNS), does the server accept a connection, is the SSL certificate valid, and what HTTP status code comes back.",
    },
  ],
};
