/**
 * Currency rules for Dodo checkouts and plan changes.
 *
 * Plan products carry INR country prices (Dodo Localized Pricing, by_currency). Add-ons can't:
 * Dodo always prices them from their USD base and converts them at live FX through Adaptive
 * Currency when the checkout or subscription is in another currency. A subscription's currency
 * is locked at checkout and never changes on a plan change.
 *
 * So a Custom size (Business + "Extra 25 sites") is always sold in USD: a fixed ₹ base plus a
 * USD add-on converted at a daily rate would give Indian customers a total that moves every
 * renewal and never matches our pricing page. Plain Starter / Pro / Business keep INR.
 */
export type CurrencyOptions = {
  billing_currency?: "USD";
  feature_flags?: { allow_currency_selection: boolean };
};

const USD_ONLY: CurrencyOptions = { billing_currency: "USD", feature_flags: { allow_currency_selection: false } };

export const localizedPricingOn = () => process.env.DODO_LOCALIZED_PRICING === "1";

/** Checkout session currency: USD unless localized pricing is on and there are no add-on blocks. */
export function checkoutCurrencyOptions(blocks: number): CurrencyOptions {
  if (localizedPricingOn() && blocks <= 0) return {};
  // Prices are USD. If Adaptive Currency is on in Dodo, charge USD anyway and hide the
  // currency picker (Indian cards often decline foreign-currency INR conversions).
  return USD_ONLY;
}

export const CUSTOM_USD_ONLY_ERROR =
  "Custom sizes are billed in US dollars, and your plan is billed in another currency, so extra sites can't be added here. Contact us and we'll set it up.";

/** Adding Extra 25 blocks needs a USD subscription (the currency can't change on a plan change). */
export function addsBlocksInWrongCurrency(subCurrency: string | null | undefined, targetBlocks: number, currentBlocks: number) {
  if (targetBlocks <= currentBlocks) return false;
  return (subCurrency || "USD").toUpperCase() !== "USD";
}
