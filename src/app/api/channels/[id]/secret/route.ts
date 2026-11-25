import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiUser, bad } from "@/lib/api-user";
import { MINUTE, rateLimit, tooMany } from "@/lib/rate-limit";
import { open } from "@/lib/channels/secret-box";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Reveals a webhook channel's signing secret to its owner (POST + JSON so it can't be read cross-site). */
export async function POST(req: Request, props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const a = await apiUser(req);
  if ("res" in a) return a.res;
  const lim = await rateLimit([{ key: `chan-secret:${a.user.id}`, limit: 20, windowMs: 10 * MINUTE }]);
  if (!lim.ok) return tooMany(lim.retryAfterSec);
  const row = await prisma.alertChannel.findFirst({ where: { id, userId: a.user.id, kind: "webhook" } });
  const cfg = row ? open<{ signingSecret?: string }>(row.config) : null;
  if (!cfg?.signingSecret) return bad("Not found", 404);
  return NextResponse.json({ signingSecret: cfg.signingSecret }, { headers: { "Cache-Control": "no-store" } });
}
