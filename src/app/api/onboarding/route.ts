import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { apiUser, bad } from "@/lib/api-user";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({ dismissed: z.boolean() }).strict();

/** Hide (or bring back) the getting-started checklist. */
export async function PATCH(req: Request) {
  const a = await apiUser(req);
  if ("res" in a) return a.res;
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return bad("Invalid setting.");
  await prisma.user.update({ where: { id: a.user.id }, data: { onboardingDismissedAt: parsed.data.dismissed ? new Date() : null } });
  return NextResponse.json({ ok: true });
}
