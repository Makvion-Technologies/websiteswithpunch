import type { BlogPost } from "../types";
import body from "./ssl-certificate-expired.md";

export const post: BlogPost = {
  slug: "ssl-certificate-expired",
  title: "SSL Certificate Expired? How to Fix It Fast",
  h1: "SSL certificate expired? How to fix it fast and stop it happening again",
  description:
    "Fix an expired SSL certificate on Certbot, cPanel, managed hosts or a paid CA, solve \"renewed but still expired\", and stop it happening again.",
  category: "ssl",
  query: "ssl certificate expired how to fix",
  published: "2026-11-11",
  updated: "2026-11-11",
  body,
  related: ["certbot-auto-renewal", "ssl-certificate-validity-47-days", "why-is-my-website-down"],
  faqs: [
    {
      q: "What happens when an SSL certificate expires?",
      a: "Browsers show a full-page security warning instead of the site, and with HSTS visitors can't click past it. APIs, webhooks and apps that call the site fail outright.",
    },
    {
      q: "How do I check when my SSL certificate expires?",
      a: "Use an SSL checker, or run openssl s_client with -servername and read the notAfter date. Check every hostname, including www and subdomains.",
    },
    {
      q: "Why does my site still show an expired certificate after renewing?",
      a: "Usually the web server wasn't reloaded, the config points at a different file, another server or CDN is serving an old certificate, or you're checking a different hostname.",
    },
    {
      q: "Does Let's Encrypt still send expiry emails?",
      a: "No. Let's Encrypt stopped sending expiration notification emails on 4 June 2025, so you need your own monitoring.",
    },
  ],
};
