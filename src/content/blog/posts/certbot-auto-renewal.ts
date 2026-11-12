import type { BlogPost } from "../types";
import body from "./certbot-auto-renewal.md";

export const post: BlogPost = {
  slug: "certbot-auto-renewal",
  title: "Let's Encrypt Auto-Renewal with Certbot: Setup & Fixes",
  h1: "Let's Encrypt auto-renewal with Certbot: check it, test it, fix it",
  description:
    "Make sure Certbot really renews your Let's Encrypt certificates: check the timer, run a dry run, reload with deploy hooks and fix common failures.",
  category: "ssl",
  query: "certbot auto renew",
  published: "2026-11-11",
  updated: "2026-11-11",
  body,
  related: ["ssl-certificate-expired", "ssl-certificate-validity-47-days", "dns-propagation-explained"],
  faqs: [
    {
      q: "Does Certbot renew certificates automatically?",
      a: "Yes, if a systemd timer or cron job runs certbot renew. Most installs add a timer that runs twice a day; check with systemctl list-timers.",
    },
    {
      q: "How do I test Certbot renewal?",
      a: "Run sudo certbot renew --dry-run. It validates against Let's Encrypt's staging environment without replacing your live certificates.",
    },
    {
      q: "Why didn't my site pick up the renewed certificate?",
      a: "The web server needs a reload to read the new file. Add a deploy hook in /etc/letsencrypt/renewal-hooks/deploy/ that reloads it after each successful renewal.",
    },
    {
      q: "Does Certbot need port 80 open?",
      a: "For HTTP-01 validation, yes. Let's Encrypt connects on port 80, though it follows redirects to HTTPS. Wildcards use DNS-01 instead.",
    },
  ],
};
