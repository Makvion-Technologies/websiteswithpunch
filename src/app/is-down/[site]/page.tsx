import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { IsDownPage } from "@/components/is-down/IsDownPage";
import { getSite, SITES } from "@/content/is-down";
import { siteCopy } from "@/content/is-down/copy";
import { pageMeta } from "@/lib/seo-meta";

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return SITES.map((s) => ({ site: s.host }));
}

type Params = { site: string };

export async function generateMetadata(props: { params: Promise<Params> }): Promise<Metadata> {
  const params = await props.params;
  const site = getSite(params.site);
  if (!site) return { title: "Not found" };
  const c = siteCopy(site);
  return pageMeta({
    path: `/is-down/${site.host}`,
    title: c.title,
    description: c.description,
    og: "is-down",
  });
}

export default async function Page(props: { params: Promise<Params> }) {
  const params = await props.params;
  const site = getSite(params.site);
  if (!site) notFound();
  if (params.site !== site.host) redirect(`/is-down/${site.host}`);
  return <IsDownPage site={site} />;
}
