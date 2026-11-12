import type { BlogPost } from "../types";
import body from "./what-happens-when-a-domain-expires.md";

export const post: BlogPost = {
  slug: "what-happens-when-a-domain-expires",
  title: "What Happens When a Domain Expires? Full Timeline",
  h1: "What happens when a domain expires? The full timeline, stage by stage",
  description:
    "From expiry to release: the grace period, 30-day redemption and 5-day pending delete, what stops working at each stage and how to get a domain back.",
  category: "domains",
  query: "what happens when a domain expires",
  published: "2026-11-11",
  updated: "2026-11-11",
  body,
  related: ["dns-propagation-explained", "website-maintenance-checklist", "why-is-my-website-down"],
  faqs: [
    {
      q: "How long after a domain expires can I renew it?",
      a: "For most gTLDs such as .com you can usually renew at the normal price for a while after expiry; the exact window is set by your registrar within the registry's grace period. After the registrar deletes it, a 30-day redemption period follows, at a higher price.",
    },
    {
      q: "Does my email stop working when the domain expires?",
      a: "Yes. When the domain stops resolving, its MX records stop too, so incoming mail bounces until the domain is renewed.",
    },
    {
      q: "What is the redemption grace period?",
      a: "A 30-day period after a gTLD is deleted during which only the original registrar can restore it for the previous owner, usually for a renewal plus a restore fee.",
    },
    {
      q: "Do .uk or .in domains follow the same timeline?",
      a: "No. Country-code domains follow their own registry's rules, so check the policy for each ccTLD.",
    },
  ],
};
