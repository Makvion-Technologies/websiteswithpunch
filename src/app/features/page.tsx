import { FeaturesHub } from "@/components/features-hub/FeaturesHub";
import { JsonLd } from "@/components/seo/JsonLd";
import { FEATURE_LINKS } from "@/content/links";
import { pageMeta } from "@/lib/seo-meta";
import { SITE_URL } from "@/lib/site-config";

export const metadata = pageMeta({
  path: "/features",
  title: "Website Monitoring Features – Uptime, SSL, Alerts & Status",
  description:
    "Website monitoring for uptime, SSL and domain expiry, plus email and Slack alerts, public status pages, a weekly report, an expiry calendar and uptime badges. From $5/month, 30-day free trial.",
  og: "features",
});
export const dynamic = "force-static";

const itemList = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Websites With Punch features",
  itemListElement: FEATURE_LINKS.map((t, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: t.title,
    url: `${SITE_URL}${t.href}`,
    description: t.body,
  })),
};

export default function Page() {
  return (
    <div>
      <JsonLd data={itemList} />
      <FeaturesHub />
    </div>
  );
}
