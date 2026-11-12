import type { BlogPost } from "../types";
import body from "./ssl-certificate-validity-47-days.md";

export const post: BlogPost = {
  slug: "ssl-certificate-validity-47-days",
  title: "47-Day SSL Certificates: The 2026–2029 Timeline",
  h1: "47-day SSL certificates: the 2026–2029 timeline and how to prepare",
  description:
    "SSL certificate lifetimes fall to 200 days in 2026, 100 in 2027 and 47 in 2029. The CA/B Forum schedule, Let's Encrypt's plan, and a readiness checklist.",
  category: "ssl",
  query: "47 day ssl certificate",
  published: "2026-11-11",
  updated: "2026-11-11",
  body,
  related: ["certbot-auto-renewal", "ssl-certificate-expired", "website-maintenance-checklist"],
  faqs: [
    {
      q: "When do SSL certificates become 47 days?",
      a: "Publicly trusted TLS certificates issued on or after 15 March 2029 can be valid for at most 47 days, under CA/Browser Forum Ballot SC-081v3.",
    },
    {
      q: "What is the maximum SSL certificate validity in 2026?",
      a: "200 days for certificates issued from 15 March 2026 to 14 March 2027. Certificates issued before 15 March 2026 keep their original validity of up to 398 days.",
    },
    {
      q: "Do existing certificates get shorter?",
      a: "No. Each certificate keeps the validity it was issued with. The new limits only apply to certificates issued after each date.",
    },
    {
      q: "Are Let's Encrypt certificates changing too?",
      a: "Yes. Its default certificates move from 90 to 64 days on 10 February 2027 and to 45 days on 16 February 2028; an opt-in 45-day profile has been available since 13 May 2026.",
    },
  ],
};
