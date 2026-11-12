export interface Env {
  DB: D1Database;
  SELF?: Fetcher;
  APP_URL: string;
  MONITOR_SECRET: string;
  CHUNK?: string;
  CHECK_TIMEOUT_MS?: string;
}

/** A site from the app: id, URL, check every N minutes, d = when the app saw it go down (0 = up). */
export interface Site {
  i: string;
  u: string;
  e: number;
  d?: number;
}

/** Outgoing-request allowance for one invocation (free plan: 50 per invocation). */
export interface Budget {
  left: number;
}

export interface CheckOutcome {
  ok: boolean;
  /** Skipped because the invocation ran out of requests. Never counted as down. */
  skip?: boolean;
  code: number | null;
  ms: number;
  err: string | null;
}

export const MIN = 60_000;
