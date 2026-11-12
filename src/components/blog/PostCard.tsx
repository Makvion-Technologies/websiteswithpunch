import Link from "next/link";
import { categoryLabel } from "@/content/blog/categories";
import type { BlogCategory } from "@/content/blog/types";
import { CategoryIcon } from "./CategoryIcon";

export type PostSummary = { slug: string; h1: string; description: string; category: BlogCategory; updated: string; date: string; minutes: number };

/** Post card for the blog index and "keep reading". Whole card is one link; no nested links. */
export function PostCard({ p, featured = false, headingLevel = 2 }: { p: PostSummary; featured?: boolean; headingLevel?: 2 | 3 }) {
  const H = headingLevel === 2 ? "h2" : "h3";
  return (
    <Link
      href={`/blog/${p.slug}`}
      className={`group flex h-full flex-col border border-rule bg-surface p-5 transition-colors hover:border-ink/25 sm:p-6 ${featured ? "lg:p-8" : ""}`}
    >
      <p className="label-caps flex items-center gap-2 text-accent">
        <CategoryIcon id={p.category} className="h-3.5 w-3.5" />
        {categoryLabel(p.category)}
      </p>
      <H
        className={`mt-3 break-words font-display font-medium tracking-tight text-ink group-hover:text-accent ${
          featured ? "text-2xl sm:text-[1.9rem] sm:leading-[1.15]" : "text-lg leading-snug"
        }`}
      >
        {p.h1}
      </H>
      <p className={`mt-3 leading-relaxed text-muted ${featured ? "text-base" : "text-sm"}`}>{p.description}</p>
      <p className="mt-auto pt-5 text-xs text-muted">
        <time dateTime={p.updated}>{p.date}</time> · {p.minutes} min read
      </p>
    </Link>
  );
}
