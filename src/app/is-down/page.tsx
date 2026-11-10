import { JsonLd } from "@/components/seo/JsonLd";
import { IsDownIndex } from "@/components/is-down/IsDownIndex";
import { POPULAR_DOWN, SITES } from "@/content/is-down";
import { pageMeta } from "@/lib/seo-meta";
import { SITE_URL } from "@/lib/site-config";

export const metadata = pageMeta({
  path: "/is-down",
  title: "Is a Website Down? Live Status Checks for Popular Sites",
  description:
    "Check if Instagram, Gmail, ChatGPT, IRCTC and 150+ other sites are down right now. Each page loads the site from our server so you can tell if it’s an outage or just you. Free, no signup.",
  og: "is-down",
});
export const dynamic = "force-static";

const itemList = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Is a website down?",
  numberOfItems: SITES.length,
  itemListElement: POPULAR_DOWN.map((s, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: `Is ${s.name} down?`,
    url: `${SITE_URL}/is-down/${s.host}`,
  })),
};

export default function Page() {
  return (
    <div>
      <JsonLd data={itemList} />
      <IsDownIndex />
    </div>
  );
}
