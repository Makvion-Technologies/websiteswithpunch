import { notFound } from "next/navigation";
import { FeaturePage } from "@/components/seo/FeaturePage";
import { HeartbeatVisual } from "@/components/marketing/HeartbeatVisual";
import { heartbeatFeature as c } from "@/content/features/heartbeat";
import { HEARTBEATS } from "@/lib/heartbeats/config";
import { pageMeta } from "@/lib/seo-meta";

export const metadata = pageMeta({ ...c, og: "cron-job-monitoring" });
export const dynamic = "force-static";

export default function Page() {
  // Only published once heartbeats are live (NEXT_PUBLIC_HEARTBEATS=1).
  if (!HEARTBEATS) notFound();
  return <FeaturePage content={c} Visual={HeartbeatVisual} tool={{ href: "/tools", label: "See the free tools" }} />;
}
