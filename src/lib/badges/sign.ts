import { createHmac, timingSafeEqual } from "node:crypto";
import { SITE_URL } from "@/lib/site-config";

function secret(): string {
  const s = process.env.BADGE_SECRET || process.env.NEXTAUTH_SECRET;
  if (!s) throw new Error("BADGE_SECRET (or NEXTAUTH_SECRET) is not set");
  return s;
}

const sig = (siteId: string) => createHmac("sha256", `badge:${secret()}`).update(siteId).digest("base64url").slice(0, 16);

/** Unguessable public key for a site's badge: "<siteId>.<signature>". */
export const badgeKey = (siteId: string) => `${siteId}.${sig(siteId)}`;

export function readBadgeKey(raw: string): string | null {
  const key = raw.replace(/\.svg$/, "");
  const [id, s] = key.split(".");
  if (!id || !s || id.length > 40) return null;
  const want = Buffer.from(sig(id));
  const got = Buffer.from(s);
  return want.length === got.length && timingSafeEqual(want, got) ? id : null;
}

export type BadgeType = "uptime" | "status";

export function badgeUrls(siteId: string) {
  const base = `${SITE_URL}/badge/${badgeKey(siteId)}.svg`;
  return { uptime: base, status: `${base}?type=status` };
}
