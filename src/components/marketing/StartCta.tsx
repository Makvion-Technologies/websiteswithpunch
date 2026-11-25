import Link from "next/link";
import { PLANS } from "@/lib/plans";

/** True facts from the plan config: Starter's price, sites and its 30-day trial. */
export const FREE_TRUST = `30 days free, then $${PLANS.starter.price}/month for ${PLANS.starter.siteLimit} sites · Cancel anytime`;
export const START_LABEL = "Start your free trial";
/** Where every "start" button goes: sign-up with Starter (the trial) chosen. */
export const START_HREF = "/signup?plan=starter";

/** Mid-page CTA band, repeated after key homepage sections. */
export function CtaBand({ line }: { line: string }) {
  return (
    <section className="border-b border-rule bg-bg">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p className="font-display text-xl font-medium tracking-tight text-ink sm:text-2xl">{line}</p>
        <div className="shrink-0 sm:text-right">
          <Link
            href={START_HREF}
            className="inline-flex bg-accent px-6 py-3 text-sm font-semibold text-white hover:bg-accent-hover"
          >
            {START_LABEL}
          </Link>
          <p className="mt-2 text-xs text-muted">{FREE_TRUST}</p>
        </div>
      </div>
    </section>
  );
}
