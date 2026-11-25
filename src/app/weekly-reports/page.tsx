import { FeaturePage } from "@/components/seo/FeaturePage";
import { WeeklyReportVisual } from "@/components/marketing/WeeklyReportVisual";
import { weeklyReportsFeature as c } from "@/content/features/weekly-reports";
import { pageMeta } from "@/lib/seo-meta";

export const metadata = pageMeta({ ...c, og: "weekly-reports" });
export const dynamic = "force-static";

export default function Page() {
  return <FeaturePage content={c} Visual={WeeklyReportVisual} tool={{ href: "/pricing", label: "See plans and pricing" }} />;
}
