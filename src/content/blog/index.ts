import { post as whyDown } from "./posts/why-is-my-website-down";
import { post as sslExpired } from "./posts/ssl-certificate-expired";
import { post as cert47 } from "./posts/ssl-certificate-validity-47-days";
import { post as domainExpires } from "./posts/what-happens-when-a-domain-expires";
import { post as nines } from "./posts/uptime-percentage-explained";
import { post as errors5xx } from "./posts/fix-502-503-504-errors";
import { post as certbot } from "./posts/certbot-auto-renewal";
import { post as dns } from "./posts/dns-propagation-explained";
import { post as redirects } from "./posts/err-too-many-redirects";
import { post as cost } from "./posts/cost-of-website-downtime";
import { post as intervals } from "./posts/uptime-check-intervals";
import { post as maintenance503 } from "./posts/website-maintenance-without-hurting-seo";
import { post as statusPage } from "./posts/status-page-guide";
import { post as checklist } from "./posts/website-maintenance-checklist";
import { blogVars } from "@/lib/blog/vars";
import type { BlogPost } from "./types";

/** Display order on /blog (the first post is featured). Add new posts at the top. */
const ALL: BlogPost[] = [
  whyDown, sslExpired, cert47, domainExpires, nines, errors5xx, certbot,
  dns, redirects, cost, intervals, maintenance503, statusPage, checklist,
];

/** Posts with build-time placeholders ({{checks}}) filled in, so copy follows the live check cadence. */
export const POSTS: BlogPost[] = ALL.map((p) => ({ ...p, body: blogVars(p.body) }));

export const getPost = (slug: string) => POSTS.find((p) => p.slug === slug);

/** Latest update across all posts (for the sitemap and the index page). */
export const BLOG_UPDATED = POSTS.reduce((d, p) => (p.updated > d ? p.updated : d), "2026-01-01");
