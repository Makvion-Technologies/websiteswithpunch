import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  isAutomatedBrowser,
  queryFromSearch,
  resetSharedToolGets,
  sharedToolGet,
} from "../src/lib/tools/auto-check";

test("isAutomatedBrowser catches crawlers, prerenders and webdriver", () => {
  assert.equal(isAutomatedBrowser("Mozilla/5.0 (Linux; Android 12) Chrome/122.0.0.0 Mobile Safari/537.36"), false);
  assert.equal(isAutomatedBrowser("Mozilla/5.0 ... Chrome/122.0.0.0", true), true);
  assert.equal(isAutomatedBrowser("Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"), true);
  assert.equal(isAutomatedBrowser("Mozilla/5.0 (Linux; Android 7.0) AppleWebKit/537.36 Chrome/95.0.4638.74 Mobile Safari/537.36 (compatible; Chrome-Lighthouse)"), true);
  assert.equal(isAutomatedBrowser("Mozilla/5.0 HeadlessChrome/122.0.0.0 Safari/537.36"), true);
  assert.equal(isAutomatedBrowser("Playwright/1.0"), true);
});

test("queryFromSearch reads q, then url, and ignores blanks", () => {
  assert.equal(queryFromSearch(""), "");
  assert.equal(queryFromSearch("?foo=1"), "");
  assert.equal(queryFromSearch("?q=instagram.com"), "instagram.com");
  assert.equal(queryFromSearch("?url=https://example.com"), "https://example.com");
  assert.equal(queryFromSearch("?url=ignored.com&q=wins.com"), "wins.com");
  assert.equal(queryFromSearch("q=plain"), "plain");
});

test("sharedToolGet reuses one in-flight GET", async () => {
  resetSharedToolGets();
  let n = 0;
  const orig = globalThis.fetch;
  globalThis.fetch = (async () => {
    n += 1;
    await new Promise((r) => setTimeout(r, 20));
    return new Response(JSON.stringify({ ok: true, host: "example.com" }), { status: 200 });
  }) as typeof fetch;
  try {
    const [a, b] = await Promise.all([sharedToolGet("/api/tools/down?q=example.com"), sharedToolGet("/api/tools/down?q=example.com")]);
    assert.equal(n, 1);
    assert.equal(a.data.host, "example.com");
    assert.equal(b.data.host, "example.com");
    assert.equal(a.ok, true);
  } finally {
    globalThis.fetch = orig;
    resetSharedToolGets();
  }
});

test("is-down pages autorun after mount and show the ECG loader", () => {
  const check = readFileSync("src/components/is-down/IsDownCheck.tsx", "utf8");
  assert.ok(check.includes("autorun"));
  assert.ok(check.includes("checkingLabel"));
  const form = readFileSync("src/components/tools/ToolForm.tsx", "utf8");
  assert.ok(form.includes("isAutomatedBrowser"));
  assert.ok(form.includes("sharedToolGet"));
  const skeleton = readFileSync("src/components/tools/ToolResult.tsx", "utf8");
  assert.ok(skeleton.includes("CheckPulse"));
  const css = readFileSync("src/app/globals.css", "utf8");
  assert.ok(css.includes("ecg-trace"));
  assert.ok(css.includes("prefers-reduced-motion"));
  const copy = readFileSync("src/content/is-down/copy.ts", "utf8");
  assert.ok(!copy.includes("Press Check now"));
  assert.ok(!copy.includes("when you press the button"));
});
