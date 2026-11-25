/** Run with `npm test`. Alert channels: target validation (SSRF), payloads, signing, secret storage. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { checkTarget, webhookUrlProblem, channelBody } from "../src/lib/channels/validate";
import { discordPayload, signBody, slackPayload, telegramPayload, webhookPayload } from "../src/lib/channels/format";
import { open, seal } from "../src/lib/channels/secret-box";
import { heartbeatMessage, siteAlertMessage, testMessage } from "../src/lib/channels/messages";

process.env.CHANNELS_SECRET = "test-channels-secret";

test("slack and discord only accept their official webhook hosts", () => {
  assert.equal(checkTarget("slack", { url: "https://hooks.slack.com/services/T0001/B0002/abcDEF123" }).ok, true);
  assert.equal(checkTarget("slack", { url: "https://evil.example/services/T0001/B0002/abc" }).ok, false);
  assert.equal(checkTarget("slack", { url: "http://hooks.slack.com/services/T0001/B0002/abc" }).ok, false);
  assert.equal(checkTarget("discord", { url: "https://discord.com/api/webhooks/123456789012/abcdefghijklmnopqrstuvwxyz_-12" }).ok, true);
  assert.equal(checkTarget("discord", { url: "https://discord.com.evil.io/api/webhooks/123456789012/abcdefghijklmnopqrstuvwxyz" }).ok, false);
});

test("telegram needs a bot token and a chat id", () => {
  assert.equal(checkTarget("telegram", { botToken: "123456789:AAH_abcdefghijklmnopqrstuvwxyz012345", chatId: "-1001234567" }).ok, true);
  assert.equal(checkTarget("telegram", { botToken: "nope", chatId: "1" }).ok, false);
  assert.equal(checkTarget("telegram", { botToken: "123456789:AAH_abcdefghijklmnopqrstuvwxyz012345", chatId: "drop table" }).ok, false);
});

test("generic webhook: https, public hostname, no credentials, safe port", () => {
  assert.equal(webhookUrlProblem("https://example.com/hook"), null);
  assert.equal(webhookUrlProblem("https://example.com:8443/hook"), null);
  assert.ok(webhookUrlProblem("http://example.com/hook"));
  assert.ok(webhookUrlProblem("https://127.0.0.1/hook"));
  assert.ok(webhookUrlProblem("https://[::1]/hook"));
  assert.ok(webhookUrlProblem("https://169.254.169.254/latest"));
  assert.ok(webhookUrlProblem("https://localhost/hook"));
  assert.ok(webhookUrlProblem("https://printer.local/hook"));
  assert.ok(webhookUrlProblem("https://user:pass@example.com/hook"));
  assert.ok(webhookUrlProblem("https://example.com:22/hook"));
  assert.ok(webhookUrlProblem("not a url"));
});

test("channel body needs a name and at least one event", () => {
  assert.equal(channelBody.safeParse({ kind: "slack", name: "x", events: [], allSites: true }).success, false);
  assert.equal(channelBody.safeParse({ kind: "slack", name: "x", events: ["down"], allSites: true }).success, true);
  assert.equal(channelBody.safeParse({ kind: "sms", name: "x", events: ["down"], allSites: true }).success, false);
});

test("secrets round-trip and tampering is rejected", () => {
  const sealed = seal({ url: "https://hooks.slack.com/services/a/b/c" });
  assert.ok(!sealed.includes("hooks.slack.com"));
  assert.deepEqual(open(sealed), { url: "https://hooks.slack.com/services/a/b/c" });
  const parts = sealed.split(".");
  parts[3] = parts[3].slice(0, -2) + (parts[3].endsWith("A") ? "BB" : "AA");
  assert.equal(open(parts.join(".")), null);
});

test("payloads carry the alert and the dashboard link", () => {
  const at = new Date("2026-11-25T06:00:00Z");
  const m = siteAlertMessage({ kind: "down", key: "down:x" }, { id: "s1", name: "Shop", url: "https://shop.example", statusCode: 503 }, at);
  assert.match(m.title, /Shop is down/);
  assert.ok(m.lines.some((l) => l.includes("HTTP 503")));
  assert.match(slackPayload(m).text, /dashboard\/sites\/s1/);
  assert.equal(discordPayload(m).embeds[0].color, 0xd92d20);
  assert.equal(telegramPayload({ ...m, title: "<b>x</b>" }, "42").text.includes("<b>x</b>"), false);
  const w = webhookPayload(m);
  assert.equal(w.event, "down");
  assert.equal(w.subject.id, "s1");
  assert.equal(heartbeatMessage("down", { id: "h1", name: "Backup", lastPingAt: null }, at).event, "heartbeat");
  assert.equal(testMessage("Ops").test, true);
});

test("webhook signature is HMAC-SHA256 of timestamp.body", () => {
  const sig = signBody("whsec_x", "1700000000", '{"a":1}');
  assert.equal(sig, `v1=${createHmac("sha256", "whsec_x").update('1700000000.{"a":1}').digest("hex")}`);
});
