import { after } from "next/server";
import { prisma } from "@/lib/prisma";

export const JOBS = {
  "cron:check": { label: "Daily check + cleanup", every: "Daily, 06:00 IST (Vercel cron)", staleMin: 26 * 60 },
  "cron:reports": { label: "Weekly report emails", every: "Daily, 07:00 IST (Vercel cron)", staleMin: 26 * 60 },
  "worker:sites": { label: "Worker site list sync", every: "Cloudflare Worker, every few minutes", staleMin: 30 },
  "worker:ingest": { label: "Worker check results", every: "Cloudflare Worker, every minute", staleMin: 15 },
  "worker:heartbeats": { label: "Worker cron-job sync", every: "Cloudflare Worker, every few minutes", staleMin: 30 },
} as const;
export type JobKey = keyof typeof JOBS;

/** One upsert per run, after the response is sent (the endpoint's latency is unchanged). */
export function markRun(key: JobKey, ok = true, ms?: number, note?: string) {
  const at = new Date();
  const data = { at, ok, ms: ms ?? null, note: note?.slice(0, 200) ?? null };
  try {
    after(() =>
      prisma.jobRun
        .upsert({ where: { key }, create: { key, ...data }, update: { ...data, runs: { increment: 1 } } })
        .then(() => undefined, (e) => console.warn("[jobs] mark failed", key, e)),
    );
  } catch {
    /* outside a request (tests): skip */
  }
}

/** ok | late | never, against each job's expected interval. */
export function jobState(at: Date | null | undefined, staleMin: number, now = Date.now()) {
  if (!at) return "never" as const;
  return now - at.getTime() > staleMin * 60_000 ? ("late" as const) : ("ok" as const);
}
