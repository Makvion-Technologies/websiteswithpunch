import type { MetadataRoute } from "next";
import { BLOG_UPDATED, POSTS } from "@/content/blog";
import { SITES } from "@/content/is-down";
import { FEATURE_LINKS, TOOL_LINKS } from "@/content/links";
import { SITE_URL } from "@/lib/site-config";

/** Public, indexable routes only (auth, app and API pages are excluded). */
export default function sitemap(): MetadataRoute.Sitemap {
  const updated = new Date("2026-11-10");
  const legal = new Date("2026-10-05");
  const page = (
    path: string,
    priority: number,
    changeFrequency: "weekly" | "monthly" | "yearly" = "monthly",
    lastModified: Date = updated,
  ) => ({
    url: `${SITE_URL}${path}`,
    lastModified,
    changeFrequency,
    priority,
  });
  return [
    page("/", 1, "weekly"),
    page("/pricing", 0.8),
    ...FEATURE_LINKS.map((l) => page(l.href, 0.8)),
    page("/tools", 0.8, "weekly"),
    page("/is-down", 0.8, "weekly"),
    ...SITES.map((s) => page(`/is-down/${s.host}`, 0.7, "weekly")),
    page("/blog", 0.7, "weekly", new Date(BLOG_UPDATED)),
    ...POSTS.map((p) => page(`/blog/${p.slug}`, 0.6, "monthly", new Date(p.updated))),
    page("/referrals", 0.5),
    ...TOOL_LINKS.map((l) => page(l.href, 0.8, "weekly")),
    page("/contact", 0.5, "yearly", legal),
    page("/terms", 0.3, "yearly", legal),
    page("/privacy", 0.3, "yearly", legal),
    page("/refund-policy", 0.3, "yearly", legal),
    page("/cookie-policy", 0.3, "yearly", legal),
  ];
}
