/**
 * Dodo Payments client (server only). Test mode until DODO_PAYMENTS_ENVIRONMENT=live_mode;
 * the SDK picks the base URL (test.dodopayments.com / live.dodopayments.com) from it.
 */
import DodoPayments from "dodopayments";
import { productIdFor } from "./dodo-products";

export type DodoEnvironment = "test_mode" | "live_mode";

export function dodoEnvironment(): DodoEnvironment {
  return process.env.DODO_PAYMENTS_ENVIRONMENT?.trim() === "live_mode" ? "live_mode" : "test_mode";
}

let cached: DodoPayments | null = null;

export function getDodo(): DodoPayments | null {
  const key = process.env.DODO_PAYMENTS_API_KEY?.trim();
  if (!key) return null;
  if (!cached) {
    // Local end-to-end tests only: point the SDK at a mock Dodo server. Ignored in production builds.
    const mock = process.env.NODE_ENV !== "production" ? process.env.DODO_PAYMENTS_MOCK_URL?.trim() : undefined;
    cached = new DodoPayments({
      bearerToken: key,
      ...(mock ? { baseURL: mock, environment: undefined } : { environment: dodoEnvironment() }),
      webhookKey: process.env.DODO_PAYMENTS_WEBHOOK_KEY?.trim() || null,
      maxRetries: 2,
      timeout: 20_000,
    });
  }
  return cached;
}

/** API key plus at least the monthly Pro product: enough to sell the main plan. */
export function isDodoConfigured(): boolean {
  return Boolean(process.env.DODO_PAYMENTS_API_KEY?.trim() && productIdFor("pro", "month"));
}

/** Base URL for return links (checkout, portal). */
export function appUrl(): string {
  return (process.env.NEXTAUTH_URL || "http://localhost:3000").replace(/\/$/, "");
}

/**
 * Text safe to show for a failed Dodo call. API errors carry a readable message (e.g.
 * "Changing plans is not supported for inactive subscriptions"); others get the fallback.
 */
/** Shown instead of Dodo's "resource could not be found" (a catalog ID in env is wrong). */
export const BILLING_SETUP_ERROR =
  "This change can't be made right now because of a billing setup issue on our side. Nothing was charged. Please try again later, or contact us from the Contact page.";

const NOT_FOUND = /could not be found|doesn'?t exist|does not exist|has been deleted|not found/i;

/** True when Dodo says an ID we sent doesn't exist (404 or its wording). */
export function isDodoNotFound(err: unknown): boolean {
  const e = err as { status?: number; error?: { message?: string }; message?: string };
  return e?.status === 404 || NOT_FOUND.test(e?.error?.message ?? "");
}

/**
 * Shown when Dodo refuses a change because of an add-on on the subscription. Old site packs are
 * detached from every product (never re-attached); the app never sends their IDs and every plan
 * change replaces the add-on list, so this should not happen. If Dodo still objects to an old
 * add-on, the customer is pointed at support instead of seeing Dodo's raw error.
 */
export const LEGACY_ADDON_ERROR =
  "This change can't be made automatically because of an add-on on your subscription (for example an older site pack). Nothing was charged. Contact us (Contact → Billing) and we'll make the change for you.";

export function dodoUserMessage(err: unknown, fallback: string): string {
  if (isDodoNotFound(err)) return BILLING_SETUP_ERROR;
  const e = err as { status?: number; error?: { message?: string } };
  const msg = e?.error?.message;
  if (typeof e?.status === "number" && e.status >= 400 && e.status < 500 && msg && /add-?on/i.test(msg)) return LEGACY_ADDON_ERROR;
  return typeof e?.status === "number" && e.status >= 400 && e.status < 500 && msg ? msg : fallback;
}

/** HTTP status of a Dodo API error (409 = a plan change is already pending, …). */
export function dodoErrorStatus(err: unknown): number | null {
  const s = (err as { status?: unknown })?.status;
  return typeof s === "number" ? s : null;
}
