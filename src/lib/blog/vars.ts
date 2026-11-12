import { FAST_CHECKS } from "@/lib/monitor/config";

/**
 * Sentences in blog posts that depend on what's live. While fast checks are off, posts describe the
 * daily check; once NEXT_PUBLIC_FAST_CHECKS=1 ships, the next build describes the minute checks.
 */
const VARS: Record<string, string> = {
  checks: FAST_CHECKS
    ? "Website Health checks uptime every 5 minutes on the Free plan and every minute on Pro and Business, and confirms a failure from a second location before it emails you."
    : "Website Health checks every site once a day today, and you can press Recheck for a fresh result at any time (once a minute per site) or turn on auto refresh while you watch a site. It emails you when a check finds the site down and again when it recovers, but because checks aren't minute-by-minute, alerts aren't real-time.",
};

export const blogVars = (body: string) => body.replace(/\{\{(\w+)\}\}/g, (m, k: string) => VARS[k] ?? m);
