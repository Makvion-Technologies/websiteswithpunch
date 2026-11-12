import { notFound } from "next/navigation";
import { AuthorBox } from "@/components/blog/AuthorBox";
import { PostCard } from "@/components/blog/PostCard";
import { PostHeader } from "@/components/blog/PostHeader";
import { Prose } from "@/components/blog/Prose";
import { MobileToc, Toc } from "@/components/blog/Toc";
import { RailCta } from "@/components/layout/RailCta";
import { SplitLayout } from "@/components/layout/SplitLayout";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { FaqBlock } from "@/components/seo/FaqBlock";
import { JsonLd } from "@/components/seo/JsonLd";
import { SoftCta } from "@/components/seo/SoftCta";
import { POSTS, getPost } from "@/content/blog";
import { formatDate, headings, parseMarkdown, readingMinutes, wordCount } from "@/lib/blog/markdown";
import { postJsonLd, postMeta } from "@/lib/blog/meta";

type Props = { params: { slug: string } };

export const dynamic = "force-static";
export const dynamicParams = false;
export const generateStaticParams = () => POSTS.map((p) => ({ slug: p.slug }));

export function generateMetadata({ params }: Props) {
  const p = getPost(params.slug);
  return p ? postMeta(p) : {};
}

const CTA = {
  uptime: "Websites With Punch checks every site you add, keeps 90 days of history and emails you when a site goes down and comes back.",
  ssl: "Websites With Punch reads each site's live certificate and emails you 30, 7 and 1 days before it expires.",
  domains: "Websites With Punch tracks every domain's expiry date over RDAP and emails you 30, 7 and 1 days before it lapses.",
  fixes: "Websites With Punch checks uptime, SSL and domain expiry for every site you add, so the next outage reaches you before your visitors.",
} as const;

/** One blog post: 720px article with FAQ and author box; contents and a small CTA in the sticky rail. */
export default function BlogPostPage({ params }: Props) {
  const p = getPost(params.slug);
  if (!p) notFound();
  const blocks = parseMarkdown(p.body);
  const toc = headings(blocks);
  const minutes = readingMinutes(p.body);
  const related = p.related.map(getPost).filter((r): r is NonNullable<typeof r> => Boolean(r));
  return (
    <SplitLayout
      sticky={false}
      aside={
        <div className="space-y-10 lg:sticky lg:top-24">
          <div className="hidden lg:block">
            <Toc items={toc} />
          </div>
          <RailCta title="Monitor it for free" body={CTA[p.category]} />
        </div>
      }
    >
      <JsonLd data={postJsonLd(p, wordCount(p.body))} />
      <Breadcrumbs items={[{ name: "Blog", href: "/blog" }, { name: p.title, href: `/blog/${p.slug}` }]} />
      <article>
        <PostHeader p={p} minutes={minutes} />
        <MobileToc items={toc} />
        <div className="mt-10">
          <Prose blocks={blocks} />
        </div>
        <div className="mt-16">
          <FaqBlock faqs={p.faqs} />
        </div>
        <div className="mt-12">
          <AuthorBox />
        </div>
      </article>
      <div className="mt-12">
        <SoftCta title="Start monitoring for free" body={`${CTA[p.category]} Free for one site, no card needed.`} />
      </div>
      <section aria-labelledby="more-title" className="mt-16">
        <h2 id="more-title" className="font-display text-2xl font-medium tracking-tight text-ink">
          Keep reading
        </h2>
        <ul className="mt-6 grid gap-4">
          {related.map((r) => (
            <li key={r.slug}>
              <PostCard
                headingLevel={3}
                p={{ slug: r.slug, h1: r.h1, description: r.description, category: r.category, updated: r.updated, date: formatDate(r.updated), minutes: readingMinutes(r.body) }}
              />
            </li>
          ))}
        </ul>
      </section>
    </SplitLayout>
  );
}
