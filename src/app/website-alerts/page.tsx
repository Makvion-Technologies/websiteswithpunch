import { FeaturePage } from "@/components/seo/FeaturePage";
import { AlertsVisual } from "@/components/marketing/AlertsVisual";
import { alertsFeature as c } from "@/content/features/alerts";
import { pageMeta } from "@/lib/seo-meta";

export const metadata = pageMeta({ ...c, og: "website-alerts" });
export const dynamic = "force-static";

export default function Page() {
  return <FeaturePage content={c} Visual={AlertsVisual} tool={{ href: "/uptime-monitoring", label: "How uptime checks work" }} />;
}
