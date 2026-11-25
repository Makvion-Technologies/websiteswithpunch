import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { loadPublicStatus } from "@/lib/status-pages/load";
import { SITE_NAME, SITE_URL } from "@/lib/site-config";
import { OverallBanner } from "@/components/status-page/OverallBanner";
import { StatusRow } from "@/components/status-page/StatusRow";
import { ThemeToggle } from "@/components/ThemeToggle";

/** Cached for 60 s (ISR) so an outage rush never reaches the database more than once a minute. */
export const revalidate = 60;
export const dynamicParams = true;
export async function generateStaticParams() {
  return [];
}

type Props = { params: Promise<{ slug: string }> };
const load = cache((slug: string) => (/^[a-z0-9-]{3,40}$/.test(slug) ? loadPublicStatus(slug) : Promise.resolve(null)));

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { slug } = await props.params;
  const s = await load(slug);
  if (!s) return { title: "Status page not found", robots: { index: false } };
  const description = s.description || `Live status and 90-day uptime for ${s.title}, monitored by ${SITE_NAME}.`;
  return {
    title: { absolute: `${s.title} Status` },
    description,
    alternates: { canonical: `${SITE_URL}/status/${s.slug}` },
    openGraph: { title: `${s.title} Status`, description, url: `${SITE_URL}/status/${s.slug}` },
  };
}

export default async function PublicStatusPage(props: Props) {
  const { slug } = await props.params;
  const s = await load(slug);
  if (!s) notFound();
  return (
    <main className="flex-1 bg-bg">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
        <header className="mb-6 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="label-caps text-muted">Status</p>
            <h1 className="mt-1 break-words font-display text-2xl font-medium text-ink sm:text-3xl">{s.title}</h1>
            {s.description && <p className="mt-2 text-sm text-muted">{s.description}</p>}
          </div>
          <ThemeToggle />
        </header>
        <OverallBanner overall={s.overall} updatedAt={s.updatedAt} />
        <ul className="mt-6 border border-rule bg-surface">
          {s.sites.map((site) => (
            <StatusRow key={site.id} site={site} />
          ))}
        </ul>
        <p className="mt-3 text-xs text-muted">Uptime is the share of checks that passed each day (UTC). Grey means no checks that day.</p>
        <footer className="mt-10 border-t border-rule pt-5 text-center text-xs text-muted">
          Powered by{" "}
          <Link href="/" className="font-medium text-ink hover:text-accent">
            Websites With Punch
          </Link>{" "}
          · uptime, SSL and domain monitoring
        </footer>
      </div>
    </main>
  );
}
