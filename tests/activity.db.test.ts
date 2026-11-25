/**
 * Session-start writes against a localhost DB: at most one per minute (atomic), login always
 * stamps lastLoginAt, geo is stored coarse.   PAYOUT_DB_TEST=1 npx tsx --test tests/activity.db.test.ts
 */
import { test, before, after } from "node:test";
import assert from "node:assert/strict";

const url = process.env.DATABASE_URL ?? "";
const host = (() => { try { return new URL(url).hostname; } catch { return ""; } })();
const run = process.env.PAYOUT_DB_TEST === "1" && ["localhost", "127.0.0.1"].includes(host);
const opts = { skip: run ? false : "set PAYOUT_DB_TEST=1 with a localhost DATABASE_URL" };
const ID = `act_${process.pid}`;
type P = typeof import("../src/lib/prisma")["prisma"];
let prisma: P;
let rec: typeof import("../src/lib/activity/record");

before(async () => {
  if (!run) return;
  prisma = (await import("../src/lib/prisma")).prisma;
  rec = await import("../src/lib/activity/record");
  await prisma.user.create({ data: { id: ID, email: `${ID}@example.test`, password: "x" } });
});
after(async () => {
  if (!run) return;
  await prisma.user.deleteMany({ where: { id: ID } });
  await prisma.$disconnect();
});

test("session start: first write records geo, a second within a minute is a no-op", opts, async () => {
  const h = new Headers({ "x-vercel-ip-country": "IN", "x-vercel-ip-city": "Pune", "user-agent": "Mozilla/5.0 (X11; Linux x86_64) Chrome/131.0 Safari/537.36" });
  const t0 = new Date("2026-11-25T08:00:00Z");
  const [a, b] = await Promise.all([rec.recordSessionStart(ID, h, "session", t0), rec.recordSessionStart(ID, h, "session", t0)]);
  assert.equal([a, b].filter(Boolean).length, 1, "parallel calls write once");
  assert.equal(await rec.recordSessionStart(ID, h, "session", new Date(t0.getTime() + 30_000)), false);
  const u = await prisma.user.findUniqueOrThrow({ where: { id: ID } });
  assert.equal(u.lastCountry, "IN");
  assert.equal(u.lastCity, "Pune");
  assert.equal(u.lastDevice, "Desktop · Chrome");
  assert.equal(u.lastActiveAt?.toISOString(), t0.toISOString());
  assert.equal(await prisma.userActivity.count({ where: { userId: ID } }), 1);
});

test("login inside the gap still stamps lastLoginAt; after the gap a new session is written", opts, async () => {
  const t1 = new Date("2026-11-25T08:00:20Z");
  assert.equal(await rec.recordSessionStart(ID, new Headers(), "login", t1), true);
  let u = await prisma.user.findUniqueOrThrow({ where: { id: ID } });
  assert.equal(u.lastLoginAt?.toISOString(), t1.toISOString());
  const t2 = new Date("2026-11-25T09:00:00Z");
  assert.equal(await rec.recordSessionStart(ID, new Headers({ "x-vercel-ip-country": "US" }), "session", t2), true);
  u = await prisma.user.findUniqueOrThrow({ where: { id: ID } });
  assert.equal(u.lastActiveAt?.toISOString(), t2.toISOString());
  assert.equal(u.lastCountry, "US");
  assert.equal(await prisma.userActivity.count({ where: { userId: ID } }), 3);
});

test("a request without geo headers keeps the last known location", opts, async () => {
  assert.equal(await rec.recordSessionStart(ID, new Headers(), "session", new Date("2026-11-25T10:00:00Z")), true);
  const u = await prisma.user.findUniqueOrThrow({ where: { id: ID } });
  assert.equal(u.lastCountry, "US");
});
