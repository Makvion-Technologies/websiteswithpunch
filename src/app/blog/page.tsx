import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { JsonLd } from "@/components/seo/JsonLd";
import { SoftCta } from "@/components/seo/SoftCta";
import { BlogIndex } from "@/components/blog/BlogIndex";
import type { PostSummary } from "@/components/blog/PostCard";
import { FRAME } from "@/components/layout/frame";
import { BLOG_UPDATED, POSTS } from "@/content/blog";
import { formatDate, readingMinutes } from "@/lib/blog/markdown";
import { AUTHOR } from "@/lib/blog/meta";
import { pageMeta } from "@/lib/seo-meta";
import { SITE_NAME, SITE_URL } from "@/lib/site-config";

export const metadata = pageMeta({
  path: "/blog",
  title: "Website Monitoring Blog: Uptime, SSL & Domain Guides",
  description:
    "Practical guides to keeping websites online: uptime targets, SSL certificate renewal, domain expiry, DNS changes and fixing 5xx errors and redirect loops.",
  og: "blog",
});
export const dynamic = "force-static";

const summaries: PostSummary[] = POSTS.map((p) => ({
  slug: p.slug,
  h1: p.h1,
  description: p.description,
  category: p.category,
  updated: p.updated,
  date: formatDate(p.updated),
  minutes: readingMinutes(p.body),
}));

const blogLd = {
  "@context": "https://schema.org",
  "@type": "Blog",
  "@id": `${SITE_URL}/blog#blog`,
  name: `${SITE_NAME} blog`,
  url: `${SITE_URL}/blog`,
  dateModified: BLOG_UPDATED,
  publisher: { "@id": `${SITE_URL}/#organization` },
  blogPost: POSTS.map((p) => ({
    "@type": "BlogPosting",
    headline: p.h1,
    url: `${SITE_URL}/blog/${p.slug}`,
    datePublished: p.published,
    dateModified: p.updated,
    author: { "@type": "Organization", "@id": `${SITE_URL}/#organization`, name: SITE_NAME },
  })),
};

/** Blog index: intro, topic filter and a card per post, then a soft CTA. */
export default function BlogPage() {
  return (
    <div className={`${FRAME} pb-20 pt-8 sm:pt-12`}>
      <JsonLd data={blogLd} />
      <Breadcrumbs items={[{ name: "Blog", href: "/blog" }]} />
      <header className="mt-8 max-w-[720px]">
        <p className="label-caps text-accent">Blog</p>
        <h1 className="mt-3 font-display text-3xl font-medium tracking-tight text-ink sm:text-[2.6rem] sm:leading-[1.1]">
          Guides to keeping websites up, secure and renewed
        </h1>
        <p className="mt-4 text-base leading-relaxed text-muted sm:text-lg">
          Practical, sourced guides on uptime, SSL certificates, domains and DNS, and on fixing the errors that take sites
          down. Written and kept up to date by the {AUTHOR.name}.
        </p>
      </header>
      <div className="mt-10">
        <BlogIndex posts={summaries} />
      </div>
      <div className="mt-16">
        <SoftCta
          title="Catch these problems before your visitors do"
          body="Website Health tracks uptime, SSL certificate expiry and domain expiry for every site you look after, on one dashboard. Free for one site, no card needed."
        />
      </div>
    </div>
  );
}
