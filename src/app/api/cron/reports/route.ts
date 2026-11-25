import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { sendDueReports } from "@/lib/reports/send";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

function authorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const got = Buffer.from(req.headers.get("authorization") || "");
  const want = Buffer.from(`Bearer ${secret}`);
  return got.length === want.length && timingSafeEqual(got, want);
}

/** Daily (vercel.json): weekly reports for the users whose weekday it is. */
export async function GET(req: Request) {
  if (!authorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const result = await sendDueReports();
  return NextResponse.json({ ok: true, ...result });
}
