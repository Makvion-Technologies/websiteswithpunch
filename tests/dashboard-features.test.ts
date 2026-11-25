/** Run with `npm test`. Status page slugs, weekly report schedule, badges, expiry calendar and .ics. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { slugProblem, slugify } from "../src/lib/status-pages/slug";
import { nextReportDate, reportBucket, reportDue, todayBucket } from "../src/lib/reports/schedule";
import { badgeSvg, uptimeColor, BADGE_COLORS } from "../src/lib/badges/svg";
import { badgeKey, readBadgeKey } from "../src/lib/badges/sign";
import { expiryEvents, groupByMonth, urgency } from "../src/lib/expiry/events";
import { buildIcs, calendarKey, readCalendarKey } from "../src/lib/expiry/ics";

process.env.BADGE_SECRET = "test-badge-secret";
const DAY = 86_400_000;
const now = Date.parse("2026-11-25T06:00:00Z");

test("status page slugs", () => {
  assert.equal(slugify("Acme Inc. — Status!"), "acme-inc-status");
  assert.equal(slugify("Café Déjà"), "cafe-deja");
  assert.equal(slugProblem("acme"), null);
  assert.ok(slugProblem("ab"));
  assert.ok(slugProblem("bad--slug"));
  assert.ok(slugProblem("-acme"));
  assert.ok(slugProblem("dashboard"));
});

test("weekly reports spread over 7 days and send at most once in 6 days", () => {
  const counts = Array(7).fill(0);
  for (let i = 0; i < 700; i++) counts[reportBucket(`user${i}`)]++;
  assert.ok(Math.min(...counts) > 60, `uneven buckets ${counts}`);
  const id = Array.from({ length: 50 }, (_, i) => `u${i}`).find((u) => reportBucket(u) === todayBucket(now))!;
  assert.equal(reportDue(id, null, now), true);
  assert.equal(reportDue(id, new Date(now - 2 * DAY), now), false);
  assert.equal(reportDue(id, new Date(now - 7 * DAY), now), true);
  const other = Array.from({ length: 50 }, (_, i) => `v${i}`).find((u) => reportBucket(u) !== todayBucket(now))!;
  assert.equal(reportDue(other, null, now), false);
  assert.equal(reportDue(other, new Date(now - 9 * DAY), now), true, "a missed week catches up");
  assert.ok(nextReportDate(other, null, now).getTime() > now);
});

test("badge svg is escaped and coloured by uptime", () => {
  const svg = badgeSvg("uptime 30d", "<99%>", BADGE_COLORS.up);
  assert.ok(svg.startsWith("<svg"));
  assert.ok(!svg.includes("<99%>"));
  assert.ok(svg.includes("#1F6FEB"));
  assert.equal(uptimeColor(99.9), BADGE_COLORS.up);
  assert.equal(uptimeColor(97), BADGE_COLORS.warn);
  assert.equal(uptimeColor(80), BADGE_COLORS.down);
  assert.equal(uptimeColor(null), BADGE_COLORS.none);
});

test("badge and calendar keys are signed", () => {
  assert.equal(readBadgeKey(`${badgeKey("site1")}.svg`), "site1");
  assert.equal(readBadgeKey("site1.forged"), null);
  assert.equal(readBadgeKey(`${badgeKey("site1").replace("site1", "site2")}.svg`), null);
  assert.equal(readCalendarKey(`${calendarKey("user1")}.ics`), "user1");
  assert.equal(readCalendarKey("user1.nope.ics"), null);
});

test("expiry events, month groups and the .ics feed", () => {
  const sites = [
    { id: "a", name: "Shop", url: "https://shop.example", sslExpiresAt: new Date(now + 5 * DAY), domainExpiresAt: new Date(now + 200 * DAY) },
    { id: "b", name: "Blog", url: "https://blog.example", sslExpiresAt: new Date(now - DAY), domainExpiresAt: null },
  ];
  const ev = expiryEvents(sites, now);
  assert.equal(ev.length, 3);
  assert.equal(ev[0].siteId, "b");
  assert.equal(urgency(ev[0].daysLeft), "overdue");
  assert.equal(urgency(ev[1].daysLeft), "soon");
  const groups = groupByMonth(ev, 12, now);
  assert.equal(groups.length, 12);
  assert.equal(groups[0].key, "2026-11");
  assert.equal(groups.reduce((n, g) => n + g.events.length, 0), 3);
  const ics = buildIcs(ev, new Date(now));
  assert.ok(ics.startsWith("BEGIN:VCALENDAR\r\n"));
  assert.equal(ics.match(/BEGIN:VEVENT/g)?.length, 3);
  assert.ok(ics.includes("TRIGGER:-P7D"));
  assert.ok(ics.includes("SUMMARY:SSL certificate expires: shop.example"));
});

test("dashboard nav items are serialisable and match the right paths", async () => {
  const { dashNav, isActive } = await import("../src/components/dash/nav-items");
  const groups = dashNav(true);
  // Server → client props must survive structured cloning (no RegExp, functions or classes).
  assert.deepEqual(JSON.parse(JSON.stringify(groups)), groups);
  const items = groups.flatMap((g) => g.items);
  const at = (path: string) => items.filter((i) => isActive(i, path)).map((i) => i.label);
  assert.deepEqual(at("/dashboard"), ["Overview"]);
  assert.deepEqual(at("/dashboard/"), ["Overview"]);
  assert.deepEqual(at("/dashboard/sites/abc"), ["Monitors"]);
  assert.deepEqual(at("/dashboard/monitors"), ["Monitors"]);
  assert.deepEqual(at("/dashboard/alerts"), ["Alerts & integrations"]);
  assert.deepEqual(at("/dashboard/alertsx"), []);
});

test("pricing cards fit the subgrid row count in PricingCard", async () => {
  const { pricingPlans } = await import("../src/components/marketing/pricing-content");
  const { HEARTBEATS } = await import("../src/lib/heartbeats/config");
  const longest = Math.max(...pricingPlans.map((p) => p.features.length));
  assert.equal(longest, HEARTBEATS ? 9 : 8);
  assert.equal(new Set(pricingPlans.map((p) => p.features.length)).size, 1, "rows stay parallel across cards");
});
