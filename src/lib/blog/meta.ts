import type { Metadata } from "next";
import type { BlogPost } from "@/content/blog/types";
import { PRODUCT_NAME, SITE_NAME, SITE_URL } from "@/lib/site-config";

/** Posts are written and reviewed by the project, not an individual. */
export const AUTHOR = { name: `${PRODUCT_NAME} team`, role: SITE_NAME } as const;

/** Share image for a post: a static PNG in /public/og/blog (made by the OG script, same look as the site's). */
export const postImage = (slug: string) => `/og/blog/${slug}.png`;

export function postMeta(p: BlogPost): Metadata {
  const path = `/blog/${p.slug}`;
  const image = { url: postImage(p.slug), width: 1200, height: 630, alt: p.h1 };
  return {
    title: { absolute: p.title },
    description: p.description,
    alternates: { canonical: path },
    authors: [{ name: AUTHOR.name }],
    openGraph: {
      type: "article",
      siteName: SITE_NAME,
      url: path,
      title: p.title,
      description: p.description,
      publishedTime: p.published,
      modifiedTime: p.updated,
      authors: [AUTHOR.name],
      images: [image],
    },
    twitter: { card: "summary_large_image", title: p.title, description: p.description, images: [image.url] },
  };
}

/** BlogPosting structured data (breadcrumbs and FAQ come from their own components). */
export function postJsonLd(p: BlogPost, words: number) {
  const url = `${SITE_URL}/blog/${p.slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${url}#article`,
    headline: p.h1,
    description: p.description,
    url,
    mainEntityOfPage: url,
    image: `${SITE_URL}${postImage(p.slug)}`,
    datePublished: p.published,
    dateModified: p.updated,
    wordCount: words,
    inLanguage: "en",
    author: { "@type": "Organization", "@id": `${SITE_URL}/#organization`, name: SITE_NAME, url: SITE_URL },
    publisher: { "@type": "Organization", "@id": `${SITE_URL}/#organization`, name: SITE_NAME, logo: { "@type": "ImageObject", url: `${SITE_URL}/icon-512.png` } },
    isPartOf: { "@type": "Blog", "@id": `${SITE_URL}/blog#blog`, name: `${SITE_NAME} blog` },
  };
}
