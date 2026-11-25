/** Run with `npm test`. Custom (add-on) checkouts stay USD; plain plans may use INR country prices. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { addsBlocksInWrongCurrency, checkoutCurrencyOptions } from "../src/lib/dodo-currency";

test("checkout currency: USD always without localized pricing", () => {
  delete process.env.DODO_LOCALIZED_PRICING;
  for (const blocks of [0, 3]) {
    assert.deepEqual(checkoutCurrencyOptions(blocks), { billing_currency: "USD", feature_flags: { allow_currency_selection: false } });
  }
});

test("checkout currency: localized pricing frees plain plans, Custom stays USD", () => {
  process.env.DODO_LOCALIZED_PRICING = "1";
  try {
    assert.deepEqual(checkoutCurrencyOptions(0), {});
    assert.equal(checkoutCurrencyOptions(1).billing_currency, "USD");
    assert.equal(checkoutCurrencyOptions(16).feature_flags?.allow_currency_selection, false);
  } finally {
    delete process.env.DODO_LOCALIZED_PRICING;
  }
});

test("adding Extra 25 blocks needs a USD subscription; removing or keeping is fine", () => {
  assert.equal(addsBlocksInWrongCurrency("USD", 3, 0), false);
  assert.equal(addsBlocksInWrongCurrency(undefined, 3, 0), false);
  assert.equal(addsBlocksInWrongCurrency("INR", 3, 0), true);
  assert.equal(addsBlocksInWrongCurrency("inr", 4, 3), true);
  assert.equal(addsBlocksInWrongCurrency("INR", 0, 0), false);
  assert.equal(addsBlocksInWrongCurrency("INR", 2, 3), false);
});

test("Dodo's real detached-pack refusal maps to the friendly add-on message, not billing setup", async () => {
  const { dodoUserMessage, isDodoNotFound, LEGACY_ADDON_ERROR } = await import("../src/lib/dodo");
  const err = {
    status: 422,
    error: { code: "MISSING_ADDON_IDS", message: "One or more addon IDs are not found or not allowed for this product : [adn_x]" },
  };
  assert.equal(dodoUserMessage(err, "fallback"), LEGACY_ADDON_ERROR);
  assert.equal(isDodoNotFound(err), false);
  assert.equal(isDodoNotFound({ status: 404, error: { message: "Product not found" } }), true);
});
