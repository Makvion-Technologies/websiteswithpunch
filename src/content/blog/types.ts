import type { Faq } from "@/components/seo/types";

export type BlogCategory = "uptime" | "ssl" | "domains" | "fixes";

/** One blog post. The body is markdown (see src/lib/blog/markdown.ts for what it supports). */
export type BlogPost = {
  slug: string;
  /** <title> and share title, 60 characters or less. */
  title: string;
  /** On-page heading; can be longer than the title. */
  h1: string;
  /** Meta description, 155 characters or less. */
  description: string;
  category: BlogCategory;
  /** The one search intent this post answers (kept for planning; not shown). */
  query: string;
  /** ISO dates (YYYY-MM-DD). */
  published: string;
  updated: string;
  body: string;
  faqs: Faq[];
  /** Slugs of 2–3 related posts. */
  related: string[];
};
