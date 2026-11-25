/**
 * Dodo product / add-on IDs from env, and the reverse map the webhook and billing routes use.
 *
 * - Each plan × interval is its own subscription product (Starter, Pro, Business).
 * - Custom = the Business product + the "Extra 25 sites" add-on (quantity 1–16). A Dodo add-on
 *   has one price and bills on its parent's cycle, so it exists twice: $5 monthly (attached to
 *   Business Monthly) and $50 yearly (attached to Business Annual).
 * - Legacy IDs are only recognised, never sold: the old $42/$420 Business products and the old
 *   Pro +5 / Business +10 site-pack add-ons. Their subscribers keep them until their renewal
 *   (scripts/migrate-legacy-billing.ts books the move to the new products for that date).
 */
import type { BillingInterval, PaidPlanId } from "./billing-interval";

export type CatalogKind = "plan" | "extra";
export type LegacyKind = "legacy-plan" | "legacy-pack";

export const CATALOG_ENV = {
  plan: {
    starter: { month: "DODO_PRODUCT_STARTER_MONTHLY", year: "DODO_PRODUCT_STARTER_ANNUAL" },
    pro: { month: "DODO_PRODUCT_PRO_MONTHLY", year: "DODO_PRODUCT_PRO_ANNUAL" },
    business: { month: "DODO_PRODUCT_BUSINESS_MONTHLY", year: "DODO_PRODUCT_BUSINESS_ANNUAL" },
  },
  extra: { month: "DODO_ADDON_EXTRA25_MONTHLY", year: "DODO_ADDON_EXTRA25_ANNUAL" },
} as const satisfies {
  plan: Record<PaidPlanId, Record<BillingInterval, string>>;
  extra: Record<BillingInterval, string>;
};

/** Retired IDs: still mapped so existing subscriptions keep working until they renew. */
export const LEGACY_ENV = {
  plan: {
    business: { month: "DODO_PRODUCT_BUSINESS_LEGACY_MONTHLY", year: "DODO_PRODUCT_BUSINESS_LEGACY_ANNUAL" },
  },
  pack: {
    pro: { month: "DODO_ADDON_PACK_PRO_MONTHLY", year: "DODO_ADDON_PACK_PRO_ANNUAL" },
    business: { month: "DODO_ADDON_PACK_BUSINESS_MONTHLY", year: "DODO_ADDON_PACK_BUSINESS_ANNUAL" },
  },
} as const;

function envValue(name: string): string | null {
  return process.env[name]?.trim() || null;
}

export function productIdFor(plan: PaidPlanId, interval: BillingInterval = "month"): string | null {
  return envValue(CATALOG_ENV.plan[plan][interval]);
}

/** The "Extra 25 sites" add-on for Custom (Business only). */
export function extraAddonIdFor(interval: BillingInterval = "month"): string | null {
  return envValue(CATALOG_ENV.extra[interval]);
}

const PLAN_NAMES: Record<PaidPlanId, string> = { starter: "Starter", pro: "Pro", business: "Business" };

/** Clear, fixable message naming the env var, e.g. for a missing annual product. */
export function missingCatalogMessage(kind: CatalogKind, plan: PaidPlanId, interval: BillingInterval): string {
  const when = interval === "year" ? "Annual" : "Monthly";
  if (kind === "extra") {
    return `${when} "Extra 25 sites" add-on is not configured. Set ${CATALOG_ENV.extra[interval]} in the server environment.`;
  }
  return `${when} ${PLAN_NAMES[plan]} product is not configured. Set ${CATALOG_ENV.plan[plan][interval]} in the server environment.`;
}

export type CatalogInfo =
  | { kind: "plan"; plan: PaidPlanId; interval: BillingInterval; legacy?: false }
  | { kind: "extra"; plan: "business"; interval: BillingInterval; legacy?: false }
  | { kind: "plan"; plan: PaidPlanId; interval: BillingInterval; legacy: true }
  | { kind: "legacy-pack"; plan: "pro" | "business"; interval: BillingInterval; legacy: true };

const INTERVALS = ["month", "year"] as const;

/** Reverse lookup over every configured ID (current and legacy). */
export function lookupCatalogId(id: string | null | undefined): CatalogInfo | null {
  if (!id) return null;
  for (const interval of INTERVALS) {
    for (const plan of ["starter", "pro", "business"] as const) {
      if (envValue(CATALOG_ENV.plan[plan][interval]) === id) return { kind: "plan", plan, interval };
    }
    if (envValue(CATALOG_ENV.extra[interval]) === id) return { kind: "extra", plan: "business", interval };
    if (envValue(LEGACY_ENV.plan.business[interval]) === id) {
      return { kind: "plan", plan: "business", interval, legacy: true };
    }
    for (const plan of ["pro", "business"] as const) {
      if (envValue(LEGACY_ENV.pack[plan][interval]) === id) return { kind: "legacy-pack", plan, interval, legacy: true };
    }
  }
  return null;
}

/** Every env var the catalog reads (current first), for setup checks. */
export function allCatalogEnvNames(): { current: string[]; legacy: string[] } {
  const current: string[] = [];
  for (const plan of ["starter", "pro", "business"] as const) {
    for (const i of INTERVALS) current.push(CATALOG_ENV.plan[plan][i]);
  }
  for (const i of INTERVALS) current.push(CATALOG_ENV.extra[i]);
  const legacy: string[] = [];
  for (const i of INTERVALS) legacy.push(LEGACY_ENV.plan.business[i]);
  for (const plan of ["pro", "business"] as const) for (const i of INTERVALS) legacy.push(LEGACY_ENV.pack[plan][i]);
  return { current, legacy };
}
