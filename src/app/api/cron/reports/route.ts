import { timingSafeEqual } from "node:crypto";
import { markRun } from "@/lib/admin/jobs";
import { NextResponse } from "next/server";
import { sendDueReports } from "@/lib/reports/send";
import { sendTrialReminders } from "@/lib/trial";

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

/** Daily (vercel.json): weekly reports for the users whose weekday it is, then trial reminders (7 and 2 days left). */
export async function GET(req: Request) {
  if (!authorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const result = await sendDueReports();
  const trials = await sendTrialReminders().catch((e) => ({ error: String(e) }));
  markRun("cron:reports", !("error" in trials), undefined, JSON.stringify({ ...result, trials }).slice(0, 200));
  return NextResponse.json({ ok: true, ...result, trials });
}
