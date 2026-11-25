import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

/**
 * AES-256-GCM for channel secrets (webhook URLs carry their own credentials, Telegram bot tokens,
 * signing secrets). Key: CHANNELS_SECRET, falling back to NEXTAUTH_SECRET so no new env var is
 * required. Format: v1.<iv>.<tag>.<ciphertext>, all base64url.
 */
function key(): Buffer {
  const s = process.env.CHANNELS_SECRET || process.env.NEXTAUTH_SECRET;
  if (!s) throw new Error("CHANNELS_SECRET (or NEXTAUTH_SECRET) is not set");
  return createHash("sha256").update(`wwp-channels:${s}`).digest();
}

export function seal(value: unknown): string {
  const iv = randomBytes(12);
  const c = createCipheriv("aes-256-gcm", key(), iv);
  const data = Buffer.concat([c.update(JSON.stringify(value), "utf8"), c.final()]);
  return ["v1", iv.toString("base64url"), c.getAuthTag().toString("base64url"), data.toString("base64url")].join(".");
}

export function open<T>(sealed: string): T | null {
  try {
    const [v, iv, tag, data] = sealed.split(".");
    if (v !== "v1" || !iv || !tag || !data) return null;
    const d = createDecipheriv("aes-256-gcm", key(), Buffer.from(iv, "base64url"));
    d.setAuthTag(Buffer.from(tag, "base64url"));
    const out = Buffer.concat([d.update(Buffer.from(data, "base64url")), d.final()]).toString("utf8");
    return JSON.parse(out) as T;
  } catch {
    return null;
  }
}
