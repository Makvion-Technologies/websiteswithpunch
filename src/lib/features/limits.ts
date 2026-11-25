import type { PlanId } from "@/lib/plans";

/** Alert channels (Slack, Discord, Telegram, webhook) per plan. Email is always on top. */
export const CHANNEL_LIMIT: Record<PlanId, number> = { free: 2, starter: 5, pro: 10, business: 25 };

/** Public status pages per plan. */
export const STATUS_PAGE_LIMIT: Record<PlanId, number> = { free: 1, starter: 1, pro: 5, business: 20 };

/** Sites shown on one status page. */
export const STATUS_PAGE_SITES = 50;

export const planWord = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;
