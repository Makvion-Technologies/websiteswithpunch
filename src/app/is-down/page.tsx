import { JsonLd } from "@/components/seo/JsonLd";
import { IsDownIndex } from "@/components/is-down/IsDownIndex";
import { POPULAR_DOWN, SITES } from "@/content/is-down";
import { pageMeta } from "@/lib/seo-meta";
import { SITE_URL } from "@/lib/site-config";

export const metadata = pageMeta({
  path: "/is-down",
  title: "Is a Website Down Right Now? Live Checks for 200+ Sites",
  description:
    "Check if Instagram, Gmail, ChatGPT, IRCTC and 200+ sites are down right now. We load each one from our server so you can tell an outage from just you.",
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
