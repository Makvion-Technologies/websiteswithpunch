import type { BlogPost } from "../types";
import body from "./fix-502-503-504-errors.md";

export const post: BlogPost = {
  slug: "fix-502-503-504-errors",
  title: "502 vs 503 vs 504 Errors: Causes and Fixes",
  h1: "502, 503 and 504 errors: what each one means and how to fix it",
  description:
    "502 Bad Gateway, 503 Service Unavailable and 504 Gateway Timeout explained: which part of your stack sends each, what the logs say and how to fix it.",
  category: "fixes",
  query: "502 503 504 error difference",
  published: "2026-11-11",
  updated: "2026-11-11",
  body,
  related: ["why-is-my-website-down", "website-maintenance-without-hurting-seo", "err-too-many-redirects"],
  faqs: [
    {
      q: "What is the difference between a 502 and a 504 error?",
      a: "Both come from a proxy or gateway. A 502 means the server behind it refused the connection or sent an invalid response; a 504 means it didn't answer in time.",
    },
    {
      q: "Is a 503 error my fault or my host's?",
      a: "Either. A 503 means the server chose not to handle the request: maintenance mode, overload, account resource limits or no healthy backends. Check for a stuck maintenance file first.",
    },
    {
      q: "Do 5xx errors hurt SEO?",
      a: "Briefly, no. Google slows crawling when it sees 5xx errors, and URLs that keep returning them are eventually dropped from the index.",
    },
  ],
};
