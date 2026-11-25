import type { PlanId } from "./plans";

export type UpgradeTarget = "starter" | "pro" | "business";

/**
 * Which "Upgrade to …" buttons a plan may show. Without a subscription ("free": legacy Free or
 * no plan yet) every paid plan is a new checkout; Starter sees Pro and Business; Pro sees
 * Business; Business grows with Custom sizes on /plan instead. Unknown (loading) sees none.
 */
export function upgradeTargets(plan: PlanId | null | undefined): UpgradeTarget[] {
  if (plan === "free") return ["starter", "pro", "business"];
  if (plan === "starter") return ["pro", "business"];
  if (plan === "pro") return ["business"];
  return [];
}
