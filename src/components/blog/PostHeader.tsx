import Image from "next/image";
import Link from "next/link";
import { categoryLabel } from "@/content/blog/categories";
import type { BlogPost } from "@/content/blog/types";
import { formatDate } from "@/lib/blog/markdown";
import { AUTHOR } from "@/lib/blog/meta";
import { CategoryIcon } from "./CategoryIcon";

/** Title block: topic, headline, standfirst and byline with published/updated dates and reading time. */
export function PostHeader({ p, minutes }: { p: BlogPost; minutes: number }) {
  return (
    <header className="mt-8">
      <Link href="/blog" className="label-caps inline-flex items-center gap-2 text-accent hover:underline hover:underline-offset-4">
        <CategoryIcon id={p.category} className="h-3.5 w-3.5" />
        {categoryLabel(p.category)}
      </Link>
      <h1 className="mt-3 break-words font-display text-3xl font-medium tracking-tight text-ink sm:text-[2.6rem] sm:leading-[1.1]">{p.h1}</h1>
      <p className="mt-4 text-base leading-relaxed text-muted sm:text-lg">{p.description}</p>
      <div className="mt-6 flex items-center gap-3 border-t border-rule pt-5">
        <Image src="/logo.svg" alt="" width={40} height={40} unoptimized className="h-10 w-10 shrink-0 object-contain" />
        <div className="min-w-0 text-sm">
          <p className="font-medium text-ink">
            {AUTHOR.name}
          </p>
          <p className="mt-0.5 text-xs text-muted">
            Published <time dateTime={p.published}>{formatDate(p.published)}</time>
            <span aria-hidden> · </span>
            Updated <time dateTime={p.updated}>{formatDate(p.updated)}</time>
            <span aria-hidden> · </span>
            {minutes} min read
          </p>
        </div>
      </div>
    </header>
  );
}
