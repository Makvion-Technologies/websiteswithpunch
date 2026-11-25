import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { SEARCH_LIMIT, searchSites } from "../src/content/is-down/search";
import { ALIASES } from "../src/content/is-down/aliases";
import { DOWN_SITES } from "../src/content/is-down/sites";

test("blank queries return no hits", () => {
  assert.deepEqual(searchSites(""), []);
  assert.deepEqual(searchSites("   "), []);
});

test("ranks official names, hosts, and aliases per keystroke", () => {
  assert.equal(searchSites("gpay")[0]?.host, "pay.google.com");
  assert.equal(searchSites("Google Pay")[0]?.host, "pay.google.com");
  assert.equal(searchSites("SBI")[0]?.host, "sbi.co.in");
  assert.ok(searchSites("sbi").some((h) => h.host === "onlinesbi.sbi"));
  assert.equal(searchSites("instagram")[0]?.host, "instagram.com");
  assert.equal(searchSites("ig")[0]?.host, "instagram.com");
  assert.equal(searchSites("amex")[0]?.host, "americanexpress.com");
  assert.equal(searchSites("aadhaar")[0]?.host, "uidai.gov.in");
  assert.equal(searchSites("kite")[0]?.host, "zerodha.com");
  assert.equal(searchSites("comcast")[0]?.host, "xfinity.com");
  assert.equal(searchSites("irctc")[0]?.host, "irctc.co.in");
});

test("short and close names do not steal the intended site", () => {
  assert.equal(searchSites("vi")[0]?.host, "myvi.in");
  assert.equal(searchSites("visa")[0]?.host, "visa.com");
  assert.equal(searchSites("canvas")[0]?.host, "instructure.com");
  assert.equal(searchSites("canva")[0]?.host, "canva.com");
});

test("unknown queries are empty and the result cap is respected", () => {
  assert.deepEqual(searchSites("zzzz-no-such-site"), []);
  assert.ok(searchSites("a").length <= SEARCH_LIMIT);
  assert.equal(searchSites("bank", 3).length, 3);
});

test("every alias host is a listed site", () => {
  const hosts = new Set<string>(DOWN_SITES.map(([host]) => host));
  for (const host of Object.keys(ALIASES)) {
    assert.ok(hosts.has(host), host);
  }
});

test("hub mounts the combobox and leaves the category lists intact", () => {
  const src = readFileSync("src/components/is-down/IsDownIndex.tsx", "utf8");
  assert.ok(src.includes("IsDownSearch"));
  assert.ok(src.includes("CATS.map"));
  assert.ok(src.includes("sitesIn"));
  assert.ok(!src.includes("\"use client\""));
  const search = readFileSync("src/components/is-down/IsDownSearch.tsx", "utf8");
  assert.ok(search.includes("\"use client\""));
  assert.ok(search.includes("role=\"combobox\""));
});
