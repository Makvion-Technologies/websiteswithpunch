/** Run with `npm test`. Paid-only pricing: prices, Custom sizes, limits, trial transitions, Worker capacity. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { CUSTOM_MAX_SITES, CUSTOM_MIN_SITES, blocksForSites, clampBlocks, customSites, getEffectiveSiteLimit, getSiteLimit, planDisplayName } from "../src/lib/plans";
import { formatPlanPrice, planPrice, sizedPrice } from "../src/lib/billing-interval";
import { checkoutBody, choiceQuery, hasTrial, parseChoice } from "../src/lib/plan-choice";
import { trialTransition } from "../src/lib/trial";
import { capacityLevel, capacityUnits, customExtraUnits, hasRoomFor, intervalsForAccount, orderForWorker, workerOffset } from "../src/lib/monitor/schedule";

test("list prices: monthly, and annual = 10 × monthly", () => {
  assert.deepEqual([planPrice("starter", "month"), planPrice("pro", "month"), planPrice("business", "month")], [5, 12, 24]);
  for (const p of ["starter", "pro", "business"] as const) assert.equal(planPrice(p, "year"), planPrice(p, "month") * 10);
  assert.equal(sizedPrice("business", 4, "month"), 44); // Custom 200 sites
  assert.equal(sizedPrice("business", 16, "month"), 104); // Custom 500 sites
  assert.equal(sizedPrice("business", 16, "year"), 1040);
  assert.equal(formatPlanPrice("starter", "month"), "$5/month");
});

test("Custom sizes: 125–500 in steps of 25, clamped", () => {
  assert.equal(CUSTOM_MIN_SITES, 125);
  assert.equal(CUSTOM_MAX_SITES, 500);
  assert.equal(customSites(4), 200);
  assert.equal(blocksForSites(210), 5);
  assert.equal(clampBlocks(99), 16);
  assert.equal(clampBlocks(-3), 0);
});

test("limits: legacy Free keeps 1 site, new no-plan accounts get 0, Custom adds blocks", () => {
  assert.equal(getSiteLimit("free", true), 1);
  assert.equal(getSiteLimit("free", false), 0);
  assert.equal(getSiteLimit("starter"), 10);
  assert.equal(getEffectiveSiteLimit("business", 4, false), 200);
  assert.equal(getEffectiveSiteLimit("pro", 4, false), 30, "blocks only count on Business");
  assert.equal(planDisplayName("business", 2), "Custom");
  assert.equal(planDisplayName("free", 0, false), "No plan");
  assert.equal(planDisplayName("free", 0, true), "Free");
});

test("plan choice: query round-trip; trial only on Starter", () => {
  const c = parseChoice("custom", "300");
  assert.deepEqual(c, { id: "custom", blocks: 8 });
  assert.equal(choiceQuery(c, "year"), "plan=custom&sites=300&interval=annual");
  assert.deepEqual(checkoutBody(c, "month"), { planId: "business", blocks: 8, interval: "monthly" });
  assert.deepEqual(parseChoice("free"), { id: "starter", blocks: 0 });
  assert.ok(hasTrial({ id: "starter", blocks: 0 }));
  assert.ok(!hasTrial({ id: "pro", blocks: 0 }));
  assert.ok(!hasTrial({ id: "custom", blocks: 1 }));
});

test("trial transitions: started, converted after the end date, upgraded mid-trial", () => {
  const end = new Date("2026-12-25T00:00:00Z");
  const none = { trialStartedAt: null, trialEndsAt: null, trialConvertedAt: null };
  const on = { trialStartedAt: new Date("2026-11-25T00:00:00Z"), trialEndsAt: end, trialConvertedAt: null };
  assert.equal(trialTransition(none, { plan: "starter", status: "active", trialEndsAt: end }), "started");
  assert.equal(trialTransition(on, { plan: "starter", status: "active", trialEndsAt: end }), null);
  // Trial flag gone but before the end date: not a conversion yet.
  assert.equal(trialTransition(on, { plan: "starter", status: "active", trialEndsAt: null }, end.getTime() - 5 * 86_400_000), null);
  assert.equal(trialTransition(on, { plan: "starter", status: "active", trialEndsAt: null }, end.getTime()), "converted");
  assert.equal(trialTransition(on, { plan: "pro", status: "active", trialEndsAt: null }, end.getTime() - 5 * 86_400_000), "upgraded");
  assert.equal(trialTransition({ ...on, trialConvertedAt: end }, { plan: "starter", status: "active", trialEndsAt: null }, end.getTime()), null);
});

test("Worker schedule: Custom's sites beyond 100 run every 3 minutes, grouped by phase", () => {
  const iv = intervalsForAccount("business", 150);
  assert.equal(iv.filter((e) => e === 1).length, 100);
  assert.equal(iv.filter((e) => e === 3).length, 50);
  assert.ok(intervalsForAccount("pro", 30).every((e) => e === 1));

  const sites = Array.from({ length: 60 }, (_, n) => ({ i: `s${n}`, e: n % 2 ? 3 : 1 }));
  const out = orderForWorker(sites);
  assert.equal(out.length, 60);
  assert.ok(out.slice(0, 30).every((s) => s.e === 1), "every-minute sites first");
  const phases = out.slice(30).map((s) => workerOffset(s.i) % 3);
  assert.deepEqual(phases, [...phases].sort((a, b) => a - b), "slow sites sorted by phase");
});

test("capacity: units, warn/full levels and the stop line", () => {
  assert.ok(Math.abs(capacityUnits([{ e: 1 }, { e: 3 }, { e: 3 }, { e: 3 }]) - 2) < 1e-9);
  assert.equal(customExtraUnits(16), 400 / 3);
  assert.equal(capacityLevel(100), "ok");
  assert.equal(capacityLevel(360), "warn");
  assert.equal(capacityLevel(480), "full");
  assert.ok(hasRoomFor(400, 80));
  assert.ok(!hasRoomFor(400, 81));
});
