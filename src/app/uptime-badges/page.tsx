import { FeaturePage } from "@/components/seo/FeaturePage";
import { UptimeBadgeVisual } from "@/components/marketing/UptimeBadgeVisual";
import { uptimeBadgesFeature as c } from "@/content/features/uptime-badges";
import { pageMeta } from "@/lib/seo-meta";

export const metadata = pageMeta({ ...c, og: "uptime-badges" });
export const dynamic = "force-static";

export default function Page() {
  return <FeaturePage content={c} Visual={UptimeBadgeVisual} tool={{ href: "/status-pages", label: "Public status pages" }} />;
}
