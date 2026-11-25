# Dodo Payments setup — Websites With Punch

Do everything in **Test Mode** first (toggle at the top of the Dodo dashboard), verify the flows below, then repeat
in **Live Mode** (see "Go live"). Test and live have **separate** API keys, products, add-ons, webhooks and IDs.

Docs used (all at https://docs.dodopayments.com): `/miscellaneous/test-mode-vs-live-mode`, `/features/products`,
`/features/addons`, `/developer-resources/webhooks`, `/api-reference/webhooks/intents/subscription`,
`/features/customer-portal`, `/developer-resources/subscription-upgrade-downgrade`, `/miscellaneous/testing-process`.

## 1. API key
Dashboard → **Developer → API Keys** → **Add API Key** (name it e.g. `wwp-vercel-test`). Copy it once →
`DODO_PAYMENTS_API_KEY`. Set `DODO_PAYMENTS_ENVIRONMENT=test_mode`.

## 2. Products (6 subscription products)
Dashboard → **Products → Create Product** → type **Subscription**. For each one: base price in **USD**,
**tax category: SaaS (Software as a Service)**. Set the **subscription period** longer than the billing interval
(e.g. 10 years) so it renews until the customer cancels. **Trial period days: 30 on the two Starter products
only, 0 on all others.** The app never passes `trial_period_days` at checkout (that would bypass Prevent Trial
Misuse), so the trial comes only from the product.

Country pricing (if your Dodo account offers it on the product's pricing): add an **India (INR)** price as below.
INR is only charged when `DODO_LOCALIZED_PRICING=1` is set in Vercel; leave that unset until every product and
add-on has its INR price.

| Product name | USD | INR | Repeat every | Trial days | Env var |
|---|---|---|---|---|---|
| Websites With Punch Starter (Monthly) | $5 | ₹399 | 1 month | 30 | `DODO_PRODUCT_STARTER_MONTHLY` |
| Websites With Punch Starter (Annual) | $50 | ₹3,990 | 1 year | 30 | `DODO_PRODUCT_STARTER_ANNUAL` |
| Websites With Punch Pro (Monthly) | $12 | ₹999 | 1 month | 0 | `DODO_PRODUCT_PRO_MONTHLY` (existing product: keep the ID, update the description) |
| Websites With Punch Pro (Annual) | $120 | ₹9,999 | 1 year | 0 | `DODO_PRODUCT_PRO_ANNUAL` (existing product: keep the ID) |
| Websites With Punch Business (Monthly) | $24 | ₹1,999 | 1 month | 0 | `DODO_PRODUCT_BUSINESS_MONTHLY` (**new** product) |
| Websites With Punch Business (Annual) | $240 | ₹19,990 | 1 year | 0 | `DODO_PRODUCT_BUSINESS_ANNUAL` (**new** product) |

### TEST-MODE IDs (set up 25 Nov 2026)
| Env var | Test-mode ID |
|---|---|
| `DODO_PRODUCT_STARTER_MONTHLY` | `pdt_0NshusnrHZPcBqdFLoAyv` ($5, 30-day trial, ₹399) |
| `DODO_PRODUCT_STARTER_ANNUAL` | `pdt_0Nshv2QmKE78gldyvvBz3` ($50, 30-day trial, ₹3,990) |
| `DODO_PRODUCT_PRO_MONTHLY` | `pdt_0NpLCIBI12ChWV6uXEHTj` ($12) |
| `DODO_PRODUCT_PRO_ANNUAL` | `pdt_0NpLCNQ2nSS0hrAQRO6x6` ($120) |
| `DODO_PRODUCT_BUSINESS_MONTHLY` | `pdt_0Nshv6gwASVqBbVSqmL00` ($24, ₹1,999) |
| `DODO_PRODUCT_BUSINESS_ANNUAL` | `pdt_0NshvHWiksYP0zVKUa8yS` ($240, ₹19,990) |
| `DODO_ADDON_EXTRA25_MONTHLY` | `adn_0NshvrMqxcDTZNOfQ7DWY` (attached only to Business Monthly) |
| `DODO_ADDON_EXTRA25_ANNUAL` | `adn_0Nshvuro8r11OXk2aEF15` (attached only to Business Annual) |
| `DODO_PRODUCT_BUSINESS_LEGACY_MONTHLY` | `pdt_0NpLCQ83EVYnmldyEf5Yo` ($42, legacy) |
| `DODO_PRODUCT_BUSINESS_LEGACY_ANNUAL` | `pdt_0NpLCTKExazFC23zjN2WB` ($420, legacy) |
| `DODO_ADDON_PACK_PRO_MONTHLY` | `adn_0NpLCnpNfnnRcNkN0A9Ve` (detached, legacy) |
| `DODO_ADDON_PACK_PRO_ANNUAL` | `adn_0NpLCqAVMPtyryAWRLpSU` (detached, legacy) |
| `DODO_ADDON_PACK_BUSINESS_MONTHLY` | `adn_0NpLCrRRJVnmh06KS7V1z` (detached, legacy) |
| `DODO_ADDON_PACK_BUSINESS_ANNUAL` | `adn_0NpLCssENw6Xe5QYmhg3t` (detached, legacy) |

Test mode also has Prevent Trial Misuse ON and INR country prices, so `DODO_LOCALIZED_PRICING=1` is valid there.
Live mode needs its own IDs (repeat this section in Live Mode).

**Existing site-pack holders after detaching:** the app never sends a retired pack ID to Dodo. Every Change Plan
sends the full add-on list for the target (Extra 25 only on Business, otherwise none), so any change a pack holder
makes (interval switch, upgrade, Custom size, downgrade) drops the old pack and moves them to a current product
that already covers their old size (Pro 30, Business 100). Renewals don't go through the app. If Dodo ever rejects
a change because of an add-on, the customer sees a "contact us, nothing was charged" message, not Dodo's raw error.

Descriptions (shown on checkout and invoices):
- Starter: "Uptime, SSL and domain expiry monitoring for up to 10 sites. 30-day free trial, then billed until you cancel."
- Pro: "Uptime, SSL and domain expiry monitoring for up to 30 sites, with alert channels and status pages."
- Business: "Uptime, SSL and domain expiry monitoring for up to 100 sites. Add sites in blocks of 25 up to 500."

The **old Business products ($42 / $420)** stay as they are (don't archive them while anyone is subscribed):
copy their IDs into `DODO_PRODUCT_BUSINESS_LEGACY_MONTHLY` / `_ANNUAL` so existing subscribers keep working until
`scripts/migrate-legacy-billing.ts --book` moves them at renewal.

Copy each product ID (`pdt_...`). Do **not** put these products in a Product Collection (that would let
customers change plans in the portal, which skips our site-limit checks).

## 3. Add-ons
### New: "Extra 25 sites" (Custom), 2 add-ons
Dashboard → **Products → Add-ons → Create Add-on** (tax category SaaS). An add-on bills on its parent's cycle,
so monthly and annual are separate. Attach each one **only** to the Business product of the same interval.

| Add-on | USD | INR | Attach to | Env var |
|---|---|---|---|---|
| Extra 25 sites (monthly) | $5 | ₹399 | Business (Monthly) only | `DODO_ADDON_EXTRA25_MONTHLY` |
| Extra 25 sites (annual) | $50 | ₹3,999 | Business (Annual) only | `DODO_ADDON_EXTRA25_ANNUAL` |

Description: "25 more monitored sites on Business (Custom plan). Sites beyond the first 100 are checked every 3 minutes."
Custom = Business + 1 to 16 of these (125 to 500 sites). Above 500 is "contact us".

### Retired: the 4 site packs
Detach the old Pro +5 and Business +10 pack add-ons from **every** product (so they can't be bought), but don't
delete them: existing subscriptions still carry them until renewal. Keep their IDs in
`DODO_ADDON_PACK_PRO_MONTHLY/_ANNUAL` and `DODO_ADDON_PACK_BUSINESS_MONTHLY/_ANNUAL` (recognised, never sold,
never counted as sites). `npx tsx scripts/check-dodo-catalog.ts` flags any pack still attached.

### Prevent Trial Misuse
Dashboard → **Settings → Subscriptions** → **Prevent Trial Misuse: ON** (one trial per customer/card).

## 4. Webhook
Dashboard → **Developer → Webhooks → Add Endpoint**:
- URL: `https://www.websiteswithpunch.com/api/webhooks/dodo` (use the www host; a redirect would break delivery)
- Events: `subscription.active` (also fires when a trial starts, with a $0 mandate), `subscription.updated`, `subscription.renewed`, `subscription.on_hold`,
  `subscription.past_due`, `subscription.plan_changed`, `subscription.cancelled`, `subscription.failed`,
  `subscription.expired`, `subscription.paused`, `subscription.unpaused`, `subscription.update_payment_method`,
  `payment.succeeded`, `payment.failed`. (Selecting all events is also fine; others are acknowledged and ignored.)
- **Create endpoint** → open its **Overview** tab → copy the signing secret (`whsec_...`) → `DODO_PAYMENTS_WEBHOOK_KEY`.
- Rotating later: **Rotate secret** on the Overview tab, then update Vercel and redeploy (old secret works 24h).
- The endpoint's Logs / **Send test event** tab shows deliveries; a 200 means received, 401 means wrong secret.

## 5. Customer portal (Manage billing)
Dashboard → **Settings → Subscriptions**:
- **Allow Immediate Cancellation: OFF** (we promise "keep your plan until period end").
- **Allow Cancellation at Next Billing Date: ON**.
- **Allow Subscription Pause: OFF**.
- **Collect Plan Change Payments by Payment Link: OFF**.
- Plan changes stay in-app because the products aren't in a collection (no "Allow Subscription Updates").
The portal is used for payment method updates (incl. reactivating an on-hold subscription), invoices and cancel.

## 6. Vercel environment variables (Production; Preview optional)
`DODO_PAYMENTS_API_KEY`, `DODO_PAYMENTS_WEBHOOK_KEY`, `DODO_PAYMENTS_ENVIRONMENT`,
`DODO_PRODUCT_STARTER_MONTHLY`, `DODO_PRODUCT_STARTER_ANNUAL`, `DODO_PRODUCT_PRO_MONTHLY`, `DODO_PRODUCT_PRO_ANNUAL`,
`DODO_PRODUCT_BUSINESS_MONTHLY`, `DODO_PRODUCT_BUSINESS_ANNUAL`, `DODO_ADDON_EXTRA25_MONTHLY`, `DODO_ADDON_EXTRA25_ANNUAL`,
legacy: `DODO_PRODUCT_BUSINESS_LEGACY_MONTHLY`, `DODO_PRODUCT_BUSINESS_LEGACY_ANNUAL`, `DODO_ADDON_PACK_PRO_MONTHLY`,
`DODO_ADDON_PACK_PRO_ANNUAL`, `DODO_ADDON_PACK_BUSINESS_MONTHLY`, `DODO_ADDON_PACK_BUSINESS_ANNUAL`;
optional: `DODO_LOCALIZED_PRICING=1` (INR), `WORKER_SITES_PER_MINUTE` (default 600, Custom capacity guard).
`NEXTAUTH_URL` must be the live site URL (checkout and portal return URLs are built from it). Redeploy after changing env.

### Launch order (paid-only pricing)
1. Create/attach/detach everything above in Dodo (test, then live) and set the env vars in Vercel.
2. `npx tsx --env-file=.env.production.local scripts/check-dodo-catalog.ts` → all green.
3. `npx prisma db push` against production: adds `legacyFree` (default **true**, so every existing account keeps
   its Free plan for life; new signups get `false`) and the trial columns. No data loss.
4. `npx tsx --env-file=.env.production.local scripts/migrate-legacy-billing.ts --reset-blocks` (old pack counts → 0).
5. Merge and deploy.
6. `scripts/migrate-legacy-billing.ts` (dry run), check the table, then `--book` to move legacy Business / pack
   subscribers to the new products at their renewal (never a price rise).

Local end-to-end without a Dodo key: `DODO_PAYMENTS_MOCK_URL` points the SDK at a mock Dodo server
(dev only; ignored when NODE_ENV=production).

## 7. Test cards (test mode only; expiry 06/32, CVV 123)
- Success: Visa `4242 4242 4242 4242`, Mastercard `5555 5555 5555 4444`, India Mastercard `5409 1626 6938 1034`
- Decline: `4000 0000 0000 0002` (generic), `4000 0000 0000 9995` (insufficient funds)
- Renewal/upgrade failure: `4000 0000 0000 0341` (expiry 12/34) — succeeds first, then declines later charges

## 8. Test-mode checklist (verify before live)
1. Sign up with Starter → verify email → checkout shows $0 today and the 30-day trial → card 4242 → dashboard says
   "Confirmed. You're on Starter"; /plan shows the trial end date; the "trial started" email arrives.
2. Same email/card again → Dodo refuses a second trial (Prevent Trial Misuse).
3. During the trial, upgrade to Pro → full $12 charged now, trial ends, "upgraded" email; Billing shows Pro.
4. Sign up with Pro / Business / Custom 200 → charged right away (no trial).
5. Custom: Change size 200 → 300 (prorated charge now); 300 → 150 booked for renewal with the keep-sites picker; Undo.
6. Pro → Business upgrade (charged now); Business → Pro and Pro → Starter downgrades booked; undo works.
7. Monthly → Annual (charged now); Annual → Monthly booked for renewal; "Keep annual billing" undoes it.
8. Cancel → plan stays to period end (during a trial: to the trial end, nothing charged); Resume undoes it.
9. Use card 0341, then trigger a renewal (Dodo: subscription → change next billing date to today) → on-hold
   banner; update the card in the portal → plan restored.
10. Trial reminders: set a test user's `trialEndsAt` to 7 days ahead, call `/api/cron/reports` with the cron secret
    → the 7-day email; 2 days ahead → the 2-day email (Dodo is re-read first).
11. Webhook log: every delivery 200, duplicates answered `duplicate: true`.

## 9. Go live
1. Switch the dashboard to **Live Mode**.
2. Create the 6 products and 2 Extra-25 add-ons exactly as above (live IDs are different), attach the add-ons to
   Business only, detach the 4 old pack add-ons, turn on Prevent Trial Misuse.
3. Create a **live** API key and a **live** webhook endpoint (same URL and events) → new signing secret.
4. Repeat Settings → Subscriptions portal settings in live mode.
5. In Vercel replace all `DODO_*` values with the live ones, set `DODO_PAYMENTS_ENVIRONMENT=live_mode`, redeploy.
6. Do one real Starter trial (nothing is charged) and one real Pro monthly purchase with your own card, check the webhook log (200) and /plan, then cancel it
   (and refund yourself from the Dodo dashboard if you like).
