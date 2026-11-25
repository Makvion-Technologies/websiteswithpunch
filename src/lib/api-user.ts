import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getEffectivePlan, type PlanId } from "@/lib/plans";
import { crossSiteBlocked } from "@/lib/same-origin";

export type ApiUser = { id: string; plan: PlanId; admin: boolean };

/** Signed-in, verified user (and CSRF guard for mutations), or the error reply to return. */
export async function apiUser(req?: Request): Promise<{ user: ApiUser } | { res: NextResponse }> {
  if (req) {
    const blocked = crossSiteBlocked(req);
    if (blocked) return { res: blocked };
  }
  const session = await getSession();
  if (!session?.user?.id) return { res: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  if (session.user.verified === false) return { res: NextResponse.json({ error: "Verify your email first." }, { status: 403 }) };
  const u = await prisma.user.findUnique({ where: { id: session.user.id }, select: { id: true, plan: true, dodoStatus: true } });
  if (!u) return { res: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  return { user: { id: u.id, plan: getEffectivePlan(u.plan, u.dodoStatus), admin: Boolean(session.user.admin) } };
}

export const bad = (error: string, status = 400) => NextResponse.json({ error }, { status });

/** Keep only ids of sites the user owns (client lists are never trusted). */
export async function ownedSiteIds(userId: string, ids: string[]): Promise<string[]> {
  if (!ids.length) return [];
  const rows = await prisma.site.findMany({ where: { userId, id: { in: [...new Set(ids)] } }, select: { id: true } });
  const ok = new Set(rows.map((r) => r.id));
  return ids.filter((id, i) => ok.has(id) && ids.indexOf(id) === i);
}
