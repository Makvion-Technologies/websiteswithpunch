import { FAST_CHECKS } from "./config";

/**
 * Best effort: tell the monitor Worker the site list changed, so a new or edited site is
 * checked within a minute instead of at the next hourly refresh. Never throws, never waits
 * more than 1.5 s, and does nothing unless fast checks are on and the Worker URL is set.
 */
export async function syncMonitor(): Promise<void> {
  const url = process.env.MONITOR_WORKER_URL;
  const secret = process.env.MONITOR_SECRET;
  if (!FAST_CHECKS || !url || !secret) return;
  try {
    await fetch(`${url.replace(/\/$/, "")}/sync`, {
      method: "POST",
      headers: { authorization: `Bearer ${secret}` },
      signal: AbortSignal.timeout(1500),
      cache: "no-store",
    });
  } catch {
    // The hourly refresh picks the change up anyway.
  }
}
