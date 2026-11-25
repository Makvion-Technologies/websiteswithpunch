import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { apiUser, bad } from "@/lib/api-user";
import { MINUTE, rateLimit, tooMany } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({ weeklyReport: z.boolean() }).strict();

/** Turn the weekly report on or off. */
export async function PATCH(req: Request) {
  const a = await apiUser(req);
  if ("res" in a) return a.res;
  const lim = await rateLimit([{ key: `report-pref:${a.user.id}`, limit: 30, windowMs: 5 * MINUTE }]);
  if (!lim.ok) return tooMany(lim.retryAfterSec);
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return bad("Invalid setting.");
  const u = await prisma.user.update({ where: { id: a.user.id }, data: parsed.data, select: { weeklyReport: true } });
  return NextResponse.json(u);
}
