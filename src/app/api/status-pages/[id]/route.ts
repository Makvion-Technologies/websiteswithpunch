import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { apiUser, bad, ownedSiteIds } from "@/lib/api-user";
import { MINUTE, rateLimit, tooMany } from "@/lib/rate-limit";
import { slugProblem } from "@/lib/status-pages/slug";
import { statusPagePatch } from "@/lib/status-pages/schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, props: Ctx) {
  const { id } = await props.params;
  const a = await apiUser(req);
  if ("res" in a) return a.res;
  const lim = await rateLimit([{ key: `sp-edit:${a.user.id}`, limit: 60, windowMs: 10 * MINUTE }]);
  if (!lim.ok) return tooMany(lim.retryAfterSec);
  const page = await prisma.statusPage.findFirst({ where: { id, userId: a.user.id } });
  if (!page) return bad("Not found", 404);
  const parsed = statusPagePatch.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return bad("Check the title, address and sites.");
  const d = parsed.data;
  const data: Record<string, unknown> = {};
  if (d.title !== undefined) data.title = d.title;
  if (d.description !== undefined) data.description = d.description || null;
  if (d.published !== undefined) data.published = d.published;
  if (d.siteIds !== undefined) {
    data.siteIds = await ownedSiteIds(a.user.id, d.siteIds);
    if (!(data.siteIds as string[]).length) return bad("Pick at least one of your sites.");
  }
  if (d.slug !== undefined && d.slug !== page.slug) {
    const problem = slugProblem(d.slug);
    if (problem) return bad(problem);
    if (await prisma.statusPage.findUnique({ where: { slug: d.slug }, select: { id: true } })) return bad("That address is taken. Try another.", 409);
    data.slug = d.slug;
  }
  const saved = await prisma.statusPage.update({ where: { id: page.id }, data });
  revalidatePath(`/status/${page.slug}`);
  if (saved.slug !== page.slug) revalidatePath(`/status/${saved.slug}`);
  return NextResponse.json({ page: saved });
}

export async function DELETE(req: Request, props: Ctx) {
  const { id } = await props.params;
  const a = await apiUser(req);
  if ("res" in a) return a.res;
  const page = await prisma.statusPage.findFirst({ where: { id, userId: a.user.id } });
  if (!page) return bad("Not found", 404);
  await prisma.statusPage.delete({ where: { id: page.id } });
  revalidatePath(`/status/${page.slug}`);
  return NextResponse.json({ ok: true });
}
