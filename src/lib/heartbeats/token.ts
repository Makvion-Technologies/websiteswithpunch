import { randomBytes } from "node:crypto";

/** 24 URL-safe characters = 144 random bits; unguessable, so the URL itself is the secret. */
export const newToken = () => randomBytes(18).toString("base64url");
