import type { PlanId } from "@/lib/plans";
import { checkEveryMin } from "@/lib/monitor/config";

/**
 * How and where checks run, for the Uptime Details panel. Keep in step with vercel.json
 * ("regions" and the /api/cron/check schedule), workers/monitor and the recheck limits.
 */
const DAILY = {
  daily: "Once a day, around 06:00 IST (automatic background check)",
  manual: "Recheck on demand, at most once a minute",
  auto: "Auto update: every 60 seconds while the site page is open",
  location: "Singapore (one location)",
};

export type CheckSchedule = typeof DAILY;

/** Daily wording until fast checks are switched on (lib/monitor/config.ts). */
export function checkSchedule(plan: PlanId | null | undefined): CheckSchedule {
  const every = checkEveryMin(plan);
  if (every == null) return DAILY;
  return {
    ...DAILY,
    daily: `Uptime every ${every === 1 ? "minute" : `${every} minutes`}; SSL and domain expiry once a day. Results are saved hourly; a confirmed outage is saved at once`,
    location:
      "Singapore, plus Cloudflare's network for the background checks (a failure is confirmed from both before we alert)",
  };
}

/** Daily wording, for places without a plan (kept for older imports). */
export const CHECK_SCHEDULE = DAILY;
