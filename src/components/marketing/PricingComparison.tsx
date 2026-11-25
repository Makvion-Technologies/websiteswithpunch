import { CUSTOM_MAX_SITES, PLANS, blocksForSites } from "@/lib/plans";
import { sizedPrice } from "@/lib/billing-interval";
import { COMPETITORS, PRICES_CHECKED, PRICES_CHECKED_ISO, type Cell } from "@/content/pricing/competitors";

function Price({ cell }: { cell: Cell }) {
  if (!cell) return <span className="text-muted">No matching tier</span>;
  return (
    <span>
      <span className="font-medium tabular-nums text-ink">{cell.price}</span>
      {cell.tier && <span className="block text-xs text-muted">{cell.tier}</span>}
    </span>
  );
}

const th = "px-3 py-3 text-left text-xs font-semibold uppercase tracking-[0.06em] text-muted";
const td = "px-3 py-3 align-top text-sm";

/** /pricing: our monthly prices next to competitors' list prices, with sources and the date checked. */
export function PricingComparison() {
  return (
    <section id="compare" className="border-b border-rule bg-bg" aria-labelledby="compare-title">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 id="compare-title" className="font-display text-2xl font-medium text-ink sm:text-3xl">
          How the prices compare
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted">
          Monthly list prices in USD, before tax, for the smallest public tier that covers each column. With us every site
          includes uptime, SSL certificate and domain expiry checks; elsewhere these are often separate monitors, and
          features differ, so follow the links before you decide.
        </p>
        <div className="mt-8 overflow-x-auto border border-rule bg-surface">
          <table className="w-full min-w-[640px] border-collapse">
            <caption className="sr-only">Website monitoring prices compared, checked {PRICES_CHECKED}</caption>
            <thead className="border-b border-rule">
              <tr>
                <th scope="col" className={th}>Service</th>
                <th scope="col" className={th}>About 10 sites</th>
                <th scope="col" className={th}>25 to 30 sites</th>
                <th scope="col" className={th}>100 sites</th>
                <th scope="col" className={th}>Free plan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rule">
              <tr className="bg-accent-soft/60">
                <th scope="row" className={`${td} text-left font-semibold text-ink`}>Websites With Punch</th>
                <td className={td}><Price cell={{ price: `$${PLANS.starter.price}`, tier: `Starter, ${PLANS.starter.siteLimit} sites` }} /></td>
                <td className={td}><Price cell={{ price: `$${PLANS.pro.price}`, tier: `Pro, ${PLANS.pro.siteLimit} sites` }} /></td>
                <td className={td}><Price cell={{ price: `$${PLANS.business.price}`, tier: `Business, ${PLANS.business.siteLimit} sites` }} /></td>
                <td className={`${td} text-muted`}>None. Starter has a 30-day free trial</td>
              </tr>
              {COMPETITORS.map((c) => (
                <tr key={c.name}>
                  <th scope="row" className={`${td} text-left font-medium text-ink`}>
                    <a href={c.url} target="_blank" rel="noopener nofollow" className="underline decoration-rule underline-offset-4 hover:decoration-ink">
                      {c.name}
                    </a>
                  </th>
                  <td className={td}><Price cell={c.ten} /></td>
                  <td className={td}><Price cell={c.thirty} /></td>
                  <td className={td}><Price cell={c.hundred} /></td>
                  <td className={`${td} text-muted`}>{c.free}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 space-y-1 text-xs leading-relaxed text-muted">
          <p>
            Prices checked <time dateTime={PRICES_CHECKED_ISO}>{PRICES_CHECKED}</time> on each linked pricing page. They can
            change at any time, and annual discounts and promotions differ by provider.
          </p>
          {COMPETITORS.filter((c) => c.note).map((c) => (
            <p key={c.name}>
              {c.name}: {c.note}
            </p>
          ))}
          <p>Above 100 sites, our Custom plan goes up to {CUSTOM_MAX_SITES} sites (200 sites for ${sizedPrice("business", blocksForSites(200), "month")}/month, {CUSTOM_MAX_SITES} for ${sizedPrice("business", blocksForSites(CUSTOM_MAX_SITES), "month")}/month).</p>
        </div>
      </div>
    </section>
  );
}
