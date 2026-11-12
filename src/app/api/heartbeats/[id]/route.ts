import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getEffectivePlan } from "@/lib/plans";
import { crossSiteBlocked } from "@/lib/same-origin";
import { HEARTBEATS, minPeriod, spanText } from "@/lib/heartbeats/config";
import { dropHeartbeat, overLimitIds, pushHeartbeat, syncHeartbeats, toWorker } from "@/lib/heartbeats/worker";
import { hbPatchSchema } from "@/lib/heartbeats/schema";

export const dynamic = "force-dynamic";

type Ctx = { params: { id: string } };

async function owned(id: string) {
  const session = await getSession();
  if (!session?.user?.id) return null;
  const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { id: true, plan: true, dodoStatus: true } });
  const hb = user ? await prisma.heartbeat.findFirst({ where: { id, userId: user.id } }) : null;
  return user && hb ? { user, hb, plan: getEffectivePlan(user.plan, user.dodoStatus) } : null;
}

/** Rename, change period / grace, or pause and resume. */
export async function PATCH(req: Request, { params }: Ctx) {
  if (!HEARTBEATS) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const blocked = crossSiteBlocked(req);
  if (blocked) return blocked;
  const o = await owned(params.id);
  if (!o) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const parsed = hbPatchSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid change." }, { status: 400 });
  const { paused, ...fields } = parsed.data;
  if (parsed.data.periodSec && parsed.data.periodSec < minPeriod(o.plan)) {
    return NextResponse.json({ error: `Free heartbeats expect a ping every ${spanText(minPeriod(o.plan))} or longer.` }, { status: 403 });
  }
  // Pausing or resuming starts fresh: no recovery email for a pause, no alert for the silence.
  const reset = paused !== undefined && paused !== o.hb.paused ? { status: "new", alertDownAt: null } : {};
  const hb = await prisma.heartbeat.update({ where: { id: o.hb.id }, data: { ...fields, ...(paused !== undefined ? { paused } : {}), ...reset } });
  const all = await prisma.heartbeat.findMany({ where: { userId: o.user.id }, select: { id: true, createdAt: true } });
  const ready = await pushHeartbeat(toWorker(hb, o.plan, overLimitIds(all, o.plan).has(hb.id)));
  return NextResponse.json({ ok: true, ready });
}

export async function DELETE(req: Request, { params }: Ctx) {
  if (!HEARTBEATS) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const origin = req.headers.get("origin");
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
  if (origin && host && new URL(origin).host !== host) return NextResponse.json({ error: "Request blocked." }, { status: 403 });
  const o = await owned(params.id);
  if (!o) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const all = await prisma.heartbeat.findMany({ where: { userId: o.user.id }, select: { id: true, createdAt: true } });
  const hadOver = overLimitIds(all, o.plan).size > 0;
  await prisma.heartbeat.delete({ where: { id: o.hb.id } });
  await dropHeartbeat(o.hb.id);
  // A freed slot can wake one that was over the limit after a downgrade.
  if (hadOver) await syncHeartbeats();
  return NextResponse.json({ ok: true });
}
