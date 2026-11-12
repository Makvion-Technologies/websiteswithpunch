import type { BlogPost } from "../types";
import body from "./err-too-many-redirects.md";

export const post: BlogPost = {
  slug: "err-too-many-redirects",
  title: "ERR_TOO_MANY_REDIRECTS: Causes and How to Fix It",
  h1: "ERR_TOO_MANY_REDIRECTS: what causes a redirect loop and how to fix it",
  description:
    "Find and fix a redirect loop: trace it with curl, then fix CDN Flexible SSL, www mismatches, WordPress site URLs, proxy headers and cached redirects.",
  category: "fixes",
  query: "err_too_many_redirects fix",
  published: "2026-11-11",
  updated: "2026-11-11",
  body,
  related: ["why-is-my-website-down", "fix-502-503-504-errors", "ssl-certificate-expired"],
  faqs: [
    {
      q: "What causes ERR_TOO_MANY_REDIRECTS?",
      a: "Two parts of your setup disagree about the right URL, such as HTTP vs HTTPS or www vs non-www, so they keep redirecting to each other. CDN Flexible SSL with an HTTPS redirect at the origin is the most common cause.",
    },
    {
      q: "How many redirects does a browser allow?",
      a: "About 20. The Fetch standard turns the 20th redirect into a network error, and Chrome and Firefox both stop at 20.",
    },
    {
      q: "Can clearing cookies fix too many redirects?",
      a: "Sometimes. Broken session cookies can cause login loops, and browsers cache 301 redirects, so test in a private window to rule them out.",
    },
  ],
};
