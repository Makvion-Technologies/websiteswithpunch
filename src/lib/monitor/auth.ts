import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";

/** The Worker sends `Authorization: Bearer <MONITOR_SECRET>`; compared in constant time. */
export function monitorAuthorized(req: Request): boolean {
  const secret = process.env.MONITOR_SECRET;
  if (!secret || secret.length < 24) return false;
  const got = Buffer.from(req.headers.get("authorization") || "");
  const want = Buffer.from(`Bearer ${secret}`);
  return got.length === want.length && timingSafeEqual(got, want);
}

export const unauthorized = () =>
  NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: { "Cache-Control": "no-store" } });
