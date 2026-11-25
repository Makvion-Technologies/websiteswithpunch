import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiUser, bad, ownedSiteIds } from "@/lib/api-user";
import { HOUR, rateLimit, tooMany } from "@/lib/rate-limit";
import { assertPublicHost } from "@/lib/net-guard";
import { CHANNEL_LIMIT } from "@/lib/features/limits";
import { seal } from "@/lib/channels/secret-box";
import { channelBody, checkTarget } from "@/lib/channels/validate";
import { toClientChannel } from "@/lib/channels/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const a = await apiUser();
  if ("res" in a) return a.res;
  const rows = await prisma.alertChannel.findMany({ where: { userId: a.user.id }, orderBy: { createdAt: "asc" } });
  return NextResponse.json({ channels: rows.map(toClientChannel) }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(req: Request) {
  const a = await apiUser(req);
  if ("res" in a) return a.res;
  if (a.user.admin) return bad("Admin accounts can't add alert channels.", 403);
  const lim = await rateLimit([{ key: `chan-add:${a.user.id}`, limit: 20, windowMs: HOUR }]);
  if (!lim.ok) return tooMany(lim.retryAfterSec);
  const parsed = channelBody.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return bad("Give the channel a name and pick at least one event.");
  const d = parsed.data;
  const count = await prisma.alertChannel.count({ where: { userId: a.user.id } });
  if (count >= CHANNEL_LIMIT[a.user.plan]) return bad(`Your plan includes ${CHANNEL_LIMIT[a.user.plan]} alert channels. Remove one or upgrade for more.`, 403);
  const t = checkTarget(d.kind, d.target ?? {});
  if (!t.ok) return bad(t.error);
  if (d.kind === "webhook") {
    try {
      await assertPublicHost(new URL(t.config.url).hostname);
    } catch {
      return bad("That host doesn't resolve to a public address.");
    }
  }
  const signingSecret = d.kind === "webhook" ? `whsec_${randomBytes(24).toString("base64url")}` : undefined;
  const siteIds = d.allSites ? [] : await ownedSiteIds(a.user.id, d.siteIds);
  if (!d.allSites && !siteIds.length) return bad("Pick at least one site, or choose All sites.");
  const row = await prisma.alertChannel.create({
    data: {
      userId: a.user.id, kind: d.kind, name: d.name, hint: t.hint, events: d.events, allSites: d.allSites, siteIds, enabled: d.enabled,
      config: seal({ ...t.config, ...(signingSecret ? { signingSecret } : {}) }),
    },
  });
  return NextResponse.json({ channel: toClientChannel(row), signingSecret }, { status: 201 });
}
