import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { NO_INDEX } from "@/lib/site-config";
import { parseChoice } from "@/lib/plan-choice";
import { parseInterval } from "@/lib/billing-interval";
import { AuthShell } from "@/components/auth/AuthShell";
import { SignupForm } from "./signup-form";
import { PendingSiteNote } from "./PendingSiteNote";
import { cleanSiteParam } from "@/lib/signup-link";

export const metadata: Metadata = {
  title: "Start Your Free Trial",
  description:
    "Create your Websites With Punch account and pick a plan to monitor uptime, SSL certificates and domain expiry. Starter is free for 30 days, then $5/month.",
  alternates: { canonical: "/signup" },
  robots: NO_INDEX,
};

export default async function SignupPage(
  props: {
    searchParams: Promise<{ plan?: string; sites?: string; interval?: string; canceled?: string; site?: string }>;
  }
) {
  const searchParams = await props.searchParams;
  const session = await getSession();
  if (session?.user) redirect("/dashboard");

  const initialChoice = parseChoice(searchParams.plan, searchParams.sites);
  const site = cleanSiteParam(searchParams.site);

  return (
    <AuthShell>
      {site ? <PendingSiteNote host={site} /> : null}
      <SignupForm
        initialChoice={initialChoice}
        initialInterval={parseInterval(searchParams.interval)}
        canceled={searchParams.canceled === "1"}
      />
    </AuthShell>
  );
}
