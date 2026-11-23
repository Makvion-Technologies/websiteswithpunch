import type { Metadata } from "next";
import { Suspense } from "react";
import { getSession } from "@/lib/auth";
import { cleanCode } from "@/lib/referrals/attribution";
import { ReferralDashboard } from "@/components/referrals/Dashboard";
import { ReferralLanding } from "@/components/referrals/Landing";
import { ReferralsSkeleton } from "@/components/skeleton/ReferralsSkeleton";

export const dynamic = "force-dynamic";

const title = "Referral Program – Earn 20% When Friends Subscribe";
const description =
  "Share your Websites With Punch link. You earn 20% on Pro and Business plan payments from people you refer, excluding site packs. Withdraw from $20.";

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: "/referrals" },
  openGraph: { title, description, url: "/referrals" },
  twitter: { title, description },
};

/** Logged out: public program page. Logged in: the dashboard, with a skeleton while it loads. */
export default async function ReferralsPage(props: { searchParams: Promise<{ ref?: string }> }) {
  const searchParams = await props.searchParams;
  const session = await getSession();
  if (!session?.user?.id) return <ReferralLanding refCode={cleanCode(searchParams.ref)} />;
  return (
    <Suspense fallback={<ReferralsSkeleton />}>
      <ReferralDashboard userId={session.user.id} />
    </Suspense>
  );
}
