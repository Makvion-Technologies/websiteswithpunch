import type { BlogPost } from "../types";
import body from "./dns-propagation-explained.md";

export const post: BlogPost = {
  slug: "dns-propagation-explained",
  title: "DNS Propagation: Why DNS Changes Take Time",
  h1: "DNS propagation explained: why changes take time and how to speed them up",
  description:
    "DNS changes don't spread, caches expire. How TTLs work, why nameserver changes take up to 48 hours, how to plan a fast change and how to check it with dig.",
  category: "domains",
  query: "dns propagation time",
  published: "2026-11-11",
  updated: "2026-11-11",
  body,
  related: ["what-happens-when-a-domain-expires", "why-is-my-website-down", "certbot-auto-renewal"],
  faqs: [
    {
      q: "How long does DNS propagation take?",
      a: "For a normal record change, as long as the old record's TTL, often between 5 minutes and an hour. Nameserver changes can take up to about 48 hours because .com's NS records are cached for two days.",
    },
    {
      q: "How can I make DNS changes take effect faster?",
      a: "Lower the record's TTL to 300 seconds at least one old TTL before the change, make the change, then raise the TTL again once everything is stable.",
    },
    {
      q: "How do I check if my DNS change has propagated?",
      a: "Query your authoritative nameserver directly with dig, then compare public resolvers such as 1.1.1.1 and 8.8.8.8. If the authoritative answer is right, the rest is just caches expiring.",
    },
  ],
};
