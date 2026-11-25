/**
 * Plans and site limits. New accounts pick a paid plan: Starter (30-day free trial, card
 * required), Pro or Business. Custom is Business plus extra 25-site blocks (a quantity add-on on
 * the Business subscription). "free" is kept only for accounts created before paid-only pricing
 * (User.legacyFree): 1 site, forever. A newer account without an active subscription is on
 * "free" with a limit of 0 (no plan: monitoring paused, nothing deleted).
 *
 * Note: the User columns `sitePackCount` / `pendingSitePackCount` / `pendingPackChangeAt` now
 * hold the Custom extra-block quantity (old site packs are retired; see lib/dodo-products.ts).
 */
export type PlanId = "free" | "starter" | "pro" | "business";
export type PaidPlan = Exclude<PlanId, "free">;

export const PLANS = {
  free: {
    id: "free" as const,
    name: "Free",
    price: 0,
    siteLimit: 1,
    description: "Your original Free plan: one site with uptime, SSL and domain checks, free for life.",
    highlight: false,
  },
  starter: {
    id: "starter" as const,
    name: "Starter",
    price: 5,
    siteLimit: 10,
    description: "Monitor up to 10 sites with uptime, SSL and domain checks. Starts with a 30-day free trial.",
    highlight: false,
  },
  pro: {
    id: "pro" as const,
    name: "Pro",
    price: 12,
    siteLimit: 30,
    description: "Monitor up to 30 sites, with more alert channels, status pages and cron job monitors.",
    highlight: true,
  },
  business: {
    id: "business" as const,
    name: "Business",
    price: 24,
    siteLimit: 100,
    description: "Monitor up to 100 sites. Need more? Grow to Custom, up to 500 sites, from your plan page.",
    highlight: false,
  },
} as const;

/** Order used for upgrades / downgrades. */
export const PAID_PLAN_IDS = ["starter", "pro", "business"] as const satisfies readonly PaidPlan[];

/** One tier down (downgrade target): Business / Custom → Pro, Pro → Starter. */
export const LOWER_PLAN = { business: "pro", pro: "starter" } as const;
/** One tier up. */
export const HIGHER_PLAN = { starter: "pro", pro: "business" } as const;

/**
 * Custom: Business + N extra blocks of 25 sites at $5/month ($50/year) each, 125–500 sites.
 * The first 100 sites keep Business checks (every minute); extra sites are checked every
 * CUSTOM_EXTRA_EVERY_MIN minutes (lib/monitor/config.ts) to stay inside the free Worker.
 */
export const CUSTOM = {
  base: PLANS.business.siteLimit,
  blockSites: 25,
  blockPrice: 5,
  minBlocks: 1,
  maxBlocks: 16, // 100 + 16 × 25 = 500
} as const;

export const CUSTOM_MIN_SITES = CUSTOM.base + CUSTOM.minBlocks * CUSTOM.blockSites; // 125
export const CUSTOM_MAX_SITES = CUSTOM.base + CUSTOM.maxBlocks * CUSTOM.blockSites; // 500

export function isPaidPlanId(plan: unknown): plan is PaidPlan {
  return plan === "starter" || plan === "pro" || plan === "business";
}

/** Clamp a block count to 0…maxBlocks. */
export function clampBlocks(blocks: number | null | undefined): number {
  const n = Math.floor(Number(blocks) || 0);
  return Math.max(0, Math.min(n, CUSTOM.maxBlocks));
}

/** Sites for a Business subscription with `blocks` extra blocks. */
export function customSites(blocks: number): number {
  return CUSTOM.base + clampBlocks(blocks) * CUSTOM.blockSites;
}

/** Extra blocks for a requested Custom size (rounded up to the next 25, clamped 0…16). */
export function blocksForSites(sites: number): number {
  const extra = Math.max(0, Math.floor(Number(sites) || 0) - CUSTOM.base);
  return clampBlocks(Math.ceil(extra / CUSTOM.blockSites));
}

/** Display name: Business with extra blocks is "Custom". */
export function planDisplayName(plan: PlanId, blocks = 0, legacyFree = true): string {
  if (plan === "business" && blocks > 0) return "Custom";
  if (plan === "free" && !legacyFree) return "No plan";
  return PLANS[plan].name;
}

/**
 * Base site limit. `legacyFree` decides what "free" means: 1 site for accounts that had the
 * original Free plan, 0 for newer accounts without a subscription.
 */
export function getSiteLimit(plan: string | null | undefined, legacyFree = true): number {
  if (plan === "business") return PLANS.business.siteLimit;
  if (plan === "pro") return PLANS.pro.siteLimit;
  if (plan === "starter") return PLANS.starter.siteLimit;
  return legacyFree ? PLANS.free.siteLimit : 0;
}

/** Base limit plus Custom blocks (Business only). */
export function getEffectiveSiteLimit(
  plan: string | null | undefined,
  blocks: number | null | undefined,
  legacyFree = true,
): number {
  if (plan === "business") return customSites(blocks ?? 0);
  return getSiteLimit(plan, legacyFree);
}

/**
 * Paid plan while the Dodo subscription is active or past_due (Dodo's grace period: access
 * stays until past_due_ends_at); free when it is on_hold, cancelled, expired or missing.
 * A null status means no subscription status recorded (Free accounts, seeded test users).
 */
export function getEffectivePlan(
  plan: string | null | undefined,
  dodoStatus?: string | null,
): PlanId {
  const active = !dodoStatus || dodoStatus === "active" || dodoStatus === "past_due";
  if (active && isPaidPlanId(plan)) return plan;
  return "free";
}

export function isPaidPlan(
  plan: string | null | undefined,
  dodoStatus?: string | null,
): boolean {
  return getEffectivePlan(plan, dodoStatus) !== "free";
}

/** @deprecated Prefer isPaidPlan / getEffectivePlan */
export function isPro(
  plan: string | null | undefined,
  dodoStatus?: string | null,
): boolean {
  return isPaidPlan(plan, dodoStatus);
}

/** Resolve which block count applies to site limits right now. */
export function resolvePackCountForLimit(opts: {
  sitePackCount: number | null | undefined;
  pendingSitePackCount?: number | null;
  pendingPackChangeAt?: Date | string | null;
  now?: Date;
}): {
  packCount: number;
  /** True when a pending removal was due and should be written back to DB. */
  shouldApplyPending: boolean;
  /** True when a removal is scheduled for the future. */
  hasPendingRemoval: boolean;
} {
  const paid = Math.max(0, opts.sitePackCount ?? 0);
  const pending = opts.pendingSitePackCount;
  const atRaw = opts.pendingPackChangeAt;
  const at = atRaw ? new Date(atRaw) : null;
  const now = opts.now ?? new Date();

  if (pending != null && at && !Number.isNaN(at.getTime())) {
    if (now >= at) {
      return { packCount: Math.max(0, pending), shouldApplyPending: true, hasPendingRemoval: false };
    }
    // Still in the paid-through period: keep the higher count.
    return { packCount: paid, shouldApplyPending: false, hasPendingRemoval: pending < paid };
  }
  return { packCount: paid, shouldApplyPending: false, hasPendingRemoval: false };
}

/** Site limit using paid-through blocks until a pending reduction date passes. */
export function getUserEffectiveSiteLimit(
  plan: string | null | undefined,
  sitePackCount: number | null | undefined,
  pendingSitePackCount?: number | null,
  pendingPackChangeAt?: Date | string | null,
  legacyFree = true,
): number {
  const { packCount } = resolvePackCountForLimit({ sitePackCount, pendingSitePackCount, pendingPackChangeAt });
  return getEffectiveSiteLimit(plan, packCount, legacyFree);
}

/** Message when adding a site would go over the limit. */
export function siteLimitHint(plan: PlanId, limit: number, legacyFree: boolean, blocks: number): string {
  if (plan === "free") {
    return legacyFree
      ? `Your Free plan includes ${PLANS.free.siteLimit} site. Upgrade to Starter (${PLANS.starter.siteLimit}), Pro (${PLANS.pro.siteLimit}) or Business (${PLANS.business.siteLimit}) from Your plan.`
      : "Choose a plan to start monitoring. Starter comes with a 30-day free trial.";
  }
  if (plan === "starter") return `Starter includes ${limit} sites. Upgrade to Pro (${PLANS.pro.siteLimit} sites) from Your plan.`;
  if (plan === "pro") return `Pro includes ${limit} sites. Upgrade to Business (${PLANS.business.siteLimit} sites) from Your plan.`;
  if (blocks < CUSTOM.maxBlocks) {
    return `Your plan includes ${limit} sites. Add 25 more for $${CUSTOM.blockPrice}/month with Change size in Your plan (up to ${CUSTOM_MAX_SITES}).`;
  }
  return `You're on our largest self-serve size (${limit} sites). Contact us from the Contact page for more.`;
}
