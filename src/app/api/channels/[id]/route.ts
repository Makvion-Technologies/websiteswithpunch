import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiUser, bad, ownedSiteIds } from "@/lib/api-user";
import { MINUTE, rateLimit, tooMany } from "@/lib/rate-limit";
import { assertPublicHost } from "@/lib/net-guard";
import { open, seal } from "@/lib/channels/secret-box";
import { channelPatch, checkTarget } from "@/lib/channels/validate";
import { toClientChannel } from "@/lib/channels/client";
import type { ChannelKind } from "@/lib/channels/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

/** Rename, change events/routing, pause, or replace the target (URL / token). */
export async function PATCH(req: Request, props: Ctx) {
  const { id } = await props.params;
  const a = await apiUser(req);
  if ("res" in a) return a.res;
  const lim = await rateLimit([{ key: `chan-edit:${a.user.id}`, limit: 60, windowMs: 10 * MINUTE }]);
  if (!lim.ok) return tooMany(lim.retryAfterSec);
  const row = await prisma.alertChannel.findFirst({ where: { id, userId: a.user.id } });
  if (!row) return bad("Not found", 404);
  const parsed = channelPatch.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return bad("Invalid change.");
  const { target, siteIds, ...rest } = parsed.data;
  const data: Record<string, unknown> = { ...rest };
  if (siteIds !== undefined) data.siteIds = await ownedSiteIds(a.user.id, siteIds);
  if (rest.allSites === false && siteIds !== undefined && !(data.siteIds as string[]).length) return bad("Pick at least one site, or choose All sites.");
  if (target && Object.values(target).some((v) => v.trim())) {
    const t = checkTarget(row.kind as ChannelKind, target);
    if (!t.ok) return bad(t.error);
    if (row.kind === "webhook") {
      try {
        await assertPublicHost(new URL(t.config.url).hostname);
      } catch {
        return bad("That host doesn't resolve to a public address.");
      }
    }
    const prev = open<{ signingSecret?: string }>(row.config);
    data.config = seal({ ...t.config, ...(prev?.signingSecret ? { signingSecret: prev.signingSecret } : {}) });
    data.hint = t.hint;
    data.lastError = null;
  }
  const saved = await prisma.alertChannel.update({ where: { id: row.id }, data });
  return NextResponse.json({ channel: toClientChannel(saved) });
}

export async function DELETE(req: Request, props: Ctx) {
  const { id } = await props.params;
  const a = await apiUser(req);
  if ("res" in a) return a.res;
  const done = await prisma.alertChannel.deleteMany({ where: { id, userId: a.user.id } });
  if (!done.count) return bad("Not found", 404);
  return NextResponse.json({ ok: true });
}
