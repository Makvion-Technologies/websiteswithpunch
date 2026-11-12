"use client";

import { useState } from "react";
import { CATEGORIES } from "@/content/blog/categories";
import type { BlogCategory } from "@/content/blog/types";
import { PostCard, type PostSummary } from "./PostCard";

const CHIP = "inline-flex min-h-9 items-center gap-1.5 border px-3 text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

/**
 * Category filter + card grid. The server HTML always has every post ("All"), so crawlers and
 * no-JS readers see the full list and the first client render matches it (no hydration change).
 */
export function BlogIndex({ posts }: { posts: PostSummary[] }) {
  const [cat, setCat] = useState<BlogCategory | "all">("all");
  const shown = cat === "all" ? posts : posts.filter((p) => p.category === cat);
  const count = (id: BlogCategory) => posts.filter((p) => p.category === id).length;
  const chips: { id: BlogCategory | "all"; label: string; n: number }[] = [
    { id: "all", label: "All", n: posts.length },
    ...CATEGORIES.map((c) => ({ id: c.id, label: c.label, n: count(c.id) })),
  ];
  return (
    <div>
      <div role="group" aria-label="Filter posts by topic" className="flex flex-wrap gap-2">
        {chips.map((c) => {
          const on = cat === c.id;
          return (
            <button
              key={c.id}
              type="button"
              aria-pressed={on}
              onClick={() => setCat(c.id)}
              className={`${CHIP} ${on ? "border-accent bg-accent-soft text-ink" : "border-rule bg-surface text-ink hover:border-ink/25"}`}
            >
              {c.label}
              <span className={`text-xs tabular-nums ${on ? "text-ink" : "text-muted"}`}>{c.n}</span>
            </button>
          );
        })}
      </div>
      <p className="sr-only" aria-live="polite">
        {shown.length} posts shown
      </p>
      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
        {shown.map((p, i) => {
          const featured = cat === "all" && i === 0;
          return (
            <li key={p.slug} className={featured ? "sm:col-span-2" : ""}>
              <PostCard p={p} featured={featured} />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
