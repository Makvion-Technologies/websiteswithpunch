/**
 * Verifies the Dodo catalog IDs in env against the Dodo API (in the configured mode): the six
 * plan products (Starter, Pro, Business × monthly/annual) and the two "Extra 25 sites" add-ons
 * exist, USD prices match plans.ts, Starter carries the 30-day trial and the others none, and the
 * add-on is attached to Business of the same interval (and to nothing else we sell). Legacy IDs
 * are listed as information. Used by scripts/check-dodo-catalog.ts and logged when Dodo answers 404.
 */
import type DodoPayments from "dodopayments";
import { CATALOG_ENV, LEGACY_ENV } from "./dodo-products";
import { blockPrice, planPrice, type BillingInterval, type PaidPlanId } from "./billing-interval";

export type CatalogLine = { envVar: string; id: string | null; ok: boolean; detail: string };

const PLANS: PaidPlanId[] = ["starter", "pro", "business"];
const INTERVALS: BillingInterval[] = ["month", "year"];
const TRIAL_DAYS: Record<PaidPlanId, number> = { starter: 30, pro: 0, business: 0 };
const env = (name: string) => process.env[name]?.trim() || null;
const is404 = (e: unknown) => (e as { status?: number })?.status === 404;

export async function checkCatalog(dodo: DodoPayments): Promise<CatalogLine[]> {
  const out: CatalogLine[] = [];
  const attachedTo: Record<string, string[]> = {};
  for (const interval of INTERVALS) {
    for (const plan of PLANS) {
      const pVar = CATALOG_ENV.plan[plan][interval];
      const pid = env(pVar);
      if (!pid) {
        out.push({ envVar: pVar, id: null, ok: false, detail: "not set" });
        continue;
      }
      try {
        const p = await dodo.products.retrieve(pid);
        attachedTo[pVar] = p.addons ?? [];
        const price = "price" in p.price ? p.price.price : null;
        const trial = "trial_period_days" in p.price ? Number(p.price.trial_period_days ?? 0) : 0;
        const want = planPrice(plan, interval) * 100;
        const priceOk = price === want && p.price.currency === "USD";
        const trialOk = trial === TRIAL_DAYS[plan];
        out.push({
          envVar: pVar,
          id: pid,
          ok: priceOk && trialOk,
          detail: `"${p.name}" ${p.price.currency} ${price == null ? "?" : price / 100}${priceOk ? "" : ` (expected USD ${want / 100})`} · trial ${trial}d${trialOk ? "" : ` (expected ${TRIAL_DAYS[plan]}d)`}`,
        });
      } catch (e) {
        out.push({ envVar: pVar, id: pid, ok: false, detail: is404(e) ? "product not found in this Dodo mode" : `lookup failed: ${String(e)}` });
      }
    }

    const aVar = CATALOG_ENV.extra[interval];
    const aid = env(aVar);
    if (!aid) out.push({ envVar: aVar, id: null, ok: false, detail: "not set" });
    else {
      try {
        const a = await dodo.addons.retrieve(aid);
        const want = blockPrice(interval) * 100;
        const priceOk = a.price === want && a.currency === "USD";
        const bizVar = CATALOG_ENV.plan.business[interval];
        const onBiz = attachedTo[bizVar] ? attachedTo[bizVar].includes(aid) : null;
        const elsewhere = Object.entries(attachedTo).filter(([v, ids]) => v !== bizVar && ids.includes(aid)).map(([v]) => v);
        out.push({
          envVar: aVar,
          id: aid,
          ok: priceOk && onBiz !== false && elsewhere.length === 0,
          detail: `"${a.name}" ${a.currency} ${a.price / 100}${priceOk ? "" : ` (expected USD ${want / 100})`}${
            onBiz === false ? ` · NOT attached to ${bizVar}` : onBiz ? ` · attached to ${bizVar}` : ""
          }${elsewhere.length ? ` · also attached to ${elsewhere.join(", ")} (detach it)` : ""}`,
        });
      } catch (e) {
        out.push({ envVar: aVar, id: aid, ok: false, detail: is404(e) ? "add-on not found in this Dodo mode" : `lookup failed: ${String(e)}` });
      }
    }
  }

  // Retired site packs must not be attached to anything we sell any more.
  for (const plan of ["pro", "business"] as const) {
    for (const interval of INTERVALS) {
      const v = LEGACY_ENV.pack[plan][interval];
      const id = env(v);
      if (!id) continue;
      const still = Object.entries(attachedTo).filter(([, ids]) => ids.includes(id)).map(([pv]) => pv);
      out.push({
        envVar: v,
        id,
        ok: still.length === 0,
        detail: still.length ? `legacy site pack still attached to ${still.join(", ")} (detach it)` : "legacy site pack (recognised for existing subscribers, not sold)",
      });
    }
  }
  return out;
}

/** Log only the broken lines (IDs are not secrets); never throws. */
export async function logCatalogProblems(dodo: DodoPayments, label: string): Promise<void> {
  try {
    const bad = (await checkCatalog(dodo)).filter((l) => !l.ok);
    if (bad.length) console.error(`[dodo catalog] ${label}:`, bad.map((l) => `${l.envVar}=${l.id ?? "-"}: ${l.detail}`).join(" | "));
    else console.error(`[dodo catalog] ${label}: all catalog IDs check out; the 404 came from something else`);
  } catch (e) {
    console.error("[dodo catalog] check failed", e);
  }
}
