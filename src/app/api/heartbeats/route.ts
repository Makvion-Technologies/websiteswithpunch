import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getEffectivePlan } from "@/lib/plans";
import { crossSiteBlocked } from "@/lib/same-origin";
import { HOUR, rateLimit, tooMany } from "@/lib/rate-limit";
import { HEARTBEATS, HEARTBEAT_LIMIT, minPeriod, spanText } from "@/lib/heartbeats/config";
import { newToken } from "@/lib/heartbeats/token";
import { pushHeartbeat, toWorker } from "@/lib/heartbeats/worker";
import { loadHeartbeats } from "@/lib/heartbeats/load";
import { hbSchema } from "@/lib/heartbeats/schema";

export const dynamic = "force-dynamic";

const off = () => NextResponse.json({ error: "Heartbeats aren't available yet." }, { status: 404 });

export async function GET() {
  if (!HEARTBEATS) return off();
  const session = await getSession();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { list } = await loadHeartbeats(session.user.id);
  return NextResponse.json({ heartbeats: list }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(req: Request) {
  if (!HEARTBEATS) return off();
  const blocked = crossSiteBlocked(req);
  if (blocked) return blocked;
  const session = await getSession();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.admin) return NextResponse.json({ error: "Admin accounts can't add heartbeats." }, { status: 403 });
  const limited = await rateLimit([{ key: `add-hb:user:${session.user.id}`, limit: 30, windowMs: HOUR }]);
  if (!limited.ok) return tooMany(limited.retryAfterSec);

  const parsed = hbSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Pick a name, a period and a grace time." }, { status: 400 });
  const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { plan: true, dodoStatus: true } });
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const plan = getEffectivePlan(user.plan, user.dodoStatus);
  if (parsed.data.periodSec < minPeriod(plan)) {
    return NextResponse.json({ error: `Free heartbeats expect a ping every ${spanText(minPeriod(plan))} or longer. Upgrade for 5-minute heartbeats.`, code: "PERIOD_PLAN" }, { status: 403 });
  }
  const count = await prisma.heartbeat.count({ where: { userId: session.user.id } });
  if (count >= HEARTBEAT_LIMIT[plan]) {
    const more =
      plan === "free" || plan === "starter"
        ? ` Upgrade to Pro for ${HEARTBEAT_LIMIT.pro}, or Business for ${HEARTBEAT_LIMIT.business}.`
        : plan === "pro"
          ? ` Upgrade to Business for ${HEARTBEAT_LIMIT.business}.`
          : "";
    return NextResponse.json({ error: `Your plan includes ${HEARTBEAT_LIMIT[plan]} heartbeat${HEARTBEAT_LIMIT[plan] === 1 ? "" : "s"}.${more}`, code: "HB_LIMIT" }, { status: 403 });
  }
  const hb = await prisma.heartbeat.create({ data: { userId: session.user.id, token: newToken(), ...parsed.data } });
  const ready = await pushHeartbeat(toWorker(hb, plan, false));
  return NextResponse.json({ id: hb.id, ready }, { status: 201 });
}
