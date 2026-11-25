import { FeaturePage } from "@/components/seo/FeaturePage";
import { StatusPageVisual } from "@/components/marketing/StatusPageVisual";
import { statusPagesFeature as c } from "@/content/features/status-pages";
import { pageMeta } from "@/lib/seo-meta";

export const metadata = pageMeta({ ...c, og: "status-pages" });
export const dynamic = "force-static";

export default function Page() {
  return <FeaturePage content={c} Visual={StatusPageVisual} tool={{ href: "/blog/status-page-guide", label: "How to write status updates" }} />;
}
