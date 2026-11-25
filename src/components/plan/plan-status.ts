import type { Tone } from "@/components/details/ui";
import type { BillingSummary } from "@/components/billing/types";
import type { PlanId } from "@/lib/plans";

/** One status chip for the plan hero; the most urgent state wins. */
export function planStatus(
  plan: PlanId,
  s: BillingSummary | null,
  fallback: { cancelAtPeriodEnd?: boolean; pendingPlan?: string | null; legacyFree?: boolean },
): { tone: Tone; label: string } {
  if (plan === "free") {
    return fallback.legacyFree === false ? { tone: "warn", label: "Monitoring paused" } : { tone: "neutral", label: "Free forever" };
  }
  if (s?.paymentFailed) return { tone: "bad", label: "Payment failed" };
  const cancel = s?.cancelAtPeriodEnd ?? fallback.cancelAtPeriodEnd;
  const date = s?.pendingPlanAtFormatted;
  if (cancel) return { tone: "warn", label: date ? `Ends ${date}` : "Ends at renewal" };
  const lower = s?.pendingPlan ?? fallback.pendingPlan;
  if (lower === "pro" || lower === "starter") {
    const n = lower === "pro" ? "Pro" : "Starter";
    return { tone: "warn", label: date ? `${n} from ${date}` : `Switching to ${n}` };
  }
  if (s?.pendingInterval === "month") return { tone: "accent", label: "Monthly from renewal" };
  if (s?.hasPendingRemoval) return { tone: "accent", label: "Smaller size booked" };
  if (s?.inTrial) return { tone: "accent", label: "Free trial" };
  return { tone: "ok", label: "Active" };
}
