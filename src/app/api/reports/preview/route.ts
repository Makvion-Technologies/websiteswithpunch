import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiUser, bad } from "@/lib/api-user";
import { HOUR, rateLimit, tooMany } from "@/lib/rate-limit";
import { sendOneReport } from "@/lib/reports/send";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Emails this week's report now (2 a day, to protect the shared daily email quota). */
export async function POST(req: Request) {
  const a = await apiUser(req);
  if ("res" in a) return a.res;
  const lim = await rateLimit([{ key: `report-preview:${a.user.id}`, limit: 2, windowMs: 24 * HOUR }]);
  if (!lim.ok) return tooMany(lim.retryAfterSec, "You can send 2 previews a day. Try again tomorrow.");
  const user = await prisma.user.findUnique({ where: { id: a.user.id }, select: { id: true, email: true } });
  if (!user) return bad("Unauthorized", 401);
  const r = await sendOneReport(user);
  if (!r.sent) return bad("We couldn't send the email right now. Please try again later.", 502);
  return NextResponse.json({ ok: true, email: user.email });
}
