import https from "node:https";
import { assertSafeUrl, guardedLookup } from "@/lib/net-guard";
import { describeRequestError } from "@/lib/safe-request";

const UA = "WebsitesWithPunch-Alerts/1.0 (+https://www.websiteswithpunch.com)";

export type PostResult = { ok: true; status: number } | { ok: false; error: string };

/**
 * One HTTPS POST with the SSRF guard on DNS (the address checked is the address used), a hard
 * timeout, no redirects, and the reply body capped at 4 KB (only read for error text).
 */
export function postJson(raw: string, body: string, headers: Record<string, string> = {}, timeoutMs = 6000): Promise<PostResult> {
  return new Promise((resolve) => {
    let url: URL;
    try {
      url = assertSafeUrl(raw);
      if (url.protocol !== "https:") throw new Error("https only");
    } catch (err) {
      return resolve({ ok: false, error: err instanceof Error ? err.message : "Blocked URL" });
    }
    let done = false;
    const finish = (r: PostResult) => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      resolve(r);
    };
    const req = https.request(
      url,
      {
        method: "POST",
        agent: false,
        lookup: guardedLookup as never,
        headers: { "User-Agent": UA, "Content-Type": "application/json", "Content-Length": Buffer.byteLength(body), ...headers },
      },
      (res) => {
        const status = res.statusCode ?? 0;
        let text = "";
        res.setEncoding("utf8");
        res.on("data", (c: string) => {
          if (text.length < 4096) text += c;
          else res.destroy();
        });
        const end = () =>
          finish(status >= 200 && status < 300 ? { ok: true, status } : { ok: false, error: `HTTP ${status}${text ? `: ${text.slice(0, 160)}` : ""}` });
        res.on("end", end);
        res.on("close", end);
      },
    );
    const timer = setTimeout(() => req.destroy(Object.assign(new Error("Timed out"), { code: "ETIMEDOUT" })), timeoutMs);
    req.on("error", (err) => finish({ ok: false, error: describeRequestError(err) }));
    req.end(body);
  });
}
