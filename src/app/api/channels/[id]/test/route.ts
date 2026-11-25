import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiUser, bad } from "@/lib/api-user";
import { HOUR, MINUTE, rateLimit, tooMany } from "@/lib/rate-limit";
import { deliver } from "@/lib/channels/deliver";
import { testMessage } from "@/lib/channels/messages";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Sends a clearly marked test message. Limited per channel and per user. */
export async function POST(req: Request, props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const a = await apiUser(req);
  if ("res" in a) return a.res;
  const row = await prisma.alertChannel.findFirst({ where: { id, userId: a.user.id } });
  if (!row) return bad("Not found", 404);
  const lim = await rateLimit([
    { key: `chan-test:${row.id}`, limit: 3, windowMs: 10 * MINUTE },
    { key: `chan-test-user:${a.user.id}`, limit: 20, windowMs: HOUR },
  ]);
  if (!lim.ok) return tooMany(lim.retryAfterSec, "You've sent a few tests already. Try again in a few minutes.");
  const r = await deliver(row, testMessage(row.name));
  await prisma.alertChannel.update({
    where: { id: row.id },
    data: r.ok ? { lastSentAt: new Date(), lastError: null } : { lastError: r.error.slice(0, 200) },
  });
  if (!r.ok) return NextResponse.json({ error: `Test failed: ${r.error}` }, { status: 502 });
  return NextResponse.json({ ok: true });
}
