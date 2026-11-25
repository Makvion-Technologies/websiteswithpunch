import { FeaturePage } from "@/components/seo/FeaturePage";
import { ExpiryCalendarVisual } from "@/components/marketing/ExpiryCalendarVisual";
import { expiryCalendarFeature as c } from "@/content/features/expiry-calendar";
import { pageMeta } from "@/lib/seo-meta";

export const metadata = pageMeta({ ...c, og: "expiry-calendar" });
export const dynamic = "force-static";

export default function Page() {
  return <FeaturePage content={c} Visual={ExpiryCalendarVisual} tool={{ href: "/domain-expiry-monitoring", label: "Domain expiry monitoring" }} />;
}
