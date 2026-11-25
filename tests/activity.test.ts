import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { deviceFromUA, geoFromHeaders } from "../src/lib/activity/geo";
import { MIN_WRITE_GAP_MS, activityStatus, activityWhere, ago, shouldRecord } from "../src/lib/activity/status";
import { firstTouchFrom, parseFirstTouch } from "../src/lib/activity/source";
import { adminDecision, isAdminEmail } from "../src/lib/admin/access";
import { checksPerMinute, monthlyValue, segmentOf } from "../src/lib/admin/plan-mix";

const NOW = Date.parse("2026-11-25T08:00:00Z");

test("last-active throttle: one write per session start, never within a minute", () => {
  assert.equal(MIN_WRITE_GAP_MS, 60_000);
  assert.equal(shouldRecord(null, NOW), true);
  assert.equal(shouldRecord(new Date(NOW - 10_000), NOW), false);
  assert.equal(shouldRecord(new Date(NOW - 59_999), NOW), false);
  assert.equal(shouldRecord(new Date(NOW - 60_000), NOW), true);
});

test("activity buckets and labels", () => {
  const h = 3_600_000;
  assert.equal(activityStatus(null, NOW), "never");
  assert.equal(activityStatus(new Date(NOW - 2 * h), NOW), "today");
  assert.equal(activityStatus(new Date(NOW - 3 * 24 * h), NOW), "week");
  assert.equal(activityStatus(new Date(NOW - 20 * 24 * h), NOW), "month");
  assert.equal(activityStatus(new Date(NOW - 31 * 24 * h), NOW), "dormant");
  assert.equal(ago(new Date(NOW - 5 * 60_000), NOW), "5 min ago");
  assert.equal(ago(null, NOW), "Never");
  assert.deepEqual(Object.keys(activityWhere("dormant", NOW)), ["OR"]);
  assert.deepEqual(activityWhere(undefined, NOW), {});
});

test("geo capture: Vercel headers, URL-decoded city, bad values dropped", () => {
  const h = new Headers({ "x-vercel-ip-country": "in", "x-vercel-ip-country-region": "MH", "x-vercel-ip-city": "Navi%20Mumbai" });
  assert.deepEqual(geoFromHeaders(h), { country: "IN", region: "MH", city: "Navi Mumbai" });
  // NextAuth hands authorize() a plain header object.
  assert.deepEqual(geoFromHeaders({ "x-vercel-ip-country": "US", "x-vercel-ip-city": "San%20Jos%C3%A9" }), { country: "US", region: null, city: "San José" });
  assert.deepEqual(geoFromHeaders({ "x-vercel-ip-country": "<script>" }), { country: null, region: null, city: null });
  assert.deepEqual(geoFromHeaders(undefined), { country: null, region: null, city: null });
  assert.equal(geoFromHeaders({ "x-vercel-ip-city": "%3Cb%3EX" }).city, "bX");
});

test("device is coarse: class + browser only", () => {
  assert.equal(deviceFromUA("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36"), "Desktop · Chrome");
  assert.equal(deviceFromUA("Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1"), "Mobile · Safari");
  assert.equal(deviceFromUA("Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 Chrome/131.0 Safari/537.36 Edg/131.0"), "Desktop · Edge");
  assert.equal(deviceFromUA(null), null);
});

test("first-touch source: UTM wins, external referrer kept, own site ignored", () => {
  const utm = firstTouchFrom(new URL("https://www.websiteswithpunch.com/blog/x?utm_source=newsletter&utm_medium=email&utm_campaign=nov"), "https://mail.example.com/");
  assert.deepEqual(parseFirstTouch(utm), { source: "newsletter", medium: "email", campaign: "nov", landing: "/blog/x" });
  const ref = firstTouchFrom(new URL("https://www.websiteswithpunch.com/"), "https://www.google.com/search?q=x");
  assert.equal(parseFirstTouch(ref)?.source, "google.com");
  assert.equal(firstTouchFrom(new URL("https://www.websiteswithpunch.com/pricing"), "https://websiteswithpunch.com/"), null);
  assert.equal(firstTouchFrom(new URL("https://www.websiteswithpunch.com/"), null), null);
  assert.equal(parseFirstTouch("garbage%"), null);
});

test("admin guard: every admin URL is a 404 for non-admins, open for admins", () => {
  for (const path of ["/admin", "/admin/users", "/admin/users/abc123", "/admin/incidents", "/admin/system", "/api/admin/messages"]) {
    assert.equal(adminDecision(path, "GET", false, false), "not-found", path);
    assert.equal(adminDecision(path, "GET", true, false), "not-found", path);
    assert.equal(adminDecision(path, "GET", true, true), "next", path);
  }
  assert.equal(isAdminEmail("Boss@Example.com ", "a@x.com, boss@example.com"), true);
  assert.equal(isAdminEmail("other@example.com", "boss@example.com"), false);
  assert.equal(isAdminEmail("", ""), false);
});

test("admin guard: every admin page checks access on the server, admin layout is noindex", () => {
  const pages: string[] = [];
  const walk = (dir: string) => {
    for (const f of readdirSync(dir)) {
      const p = join(dir, f);
      if (statSync(p).isDirectory()) walk(p);
      else if (f === "page.tsx") pages.push(p);
    }
  };
  walk(join(__dirname, "../src/app/admin"));
  assert.ok(pages.length >= 10);
  for (const p of pages) assert.match(readFileSync(p, "utf8"), /requireAdmin\(\)/, p);
  const layout = readFileSync(join(__dirname, "../src/app/admin/layout.tsx"), "utf8");
  assert.match(layout, /requireAdmin\(\)/);
  assert.match(layout, /index: false/);
});

test("plan mix: segments, MRR and check load", () => {
  assert.equal(segmentOf({ plan: "free", dodoStatus: null }), "free");
  assert.equal(segmentOf({ plan: "pro", dodoStatus: "active" }), "paid");
  assert.equal(segmentOf({ plan: "pro", dodoStatus: "on_hold" }), "at-risk");
  assert.equal(segmentOf({ plan: "pro", dodoStatus: "trialing" }), "trial");
  assert.equal(monthlyValue({ plan: "pro", dodoStatus: "active", sitePackCount: 0 }), 12);
  assert.equal(monthlyValue({ plan: "pro", dodoStatus: "cancelled", sitePackCount: 0 }), 0);
  assert.equal(monthlyValue({ plan: "free", dodoStatus: null }), 0);
  assert.equal(checksPerMinute("free"), 0.2);
  assert.equal(checksPerMinute("business"), 1);
});
