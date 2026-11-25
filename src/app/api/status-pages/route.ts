import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { apiUser, bad, ownedSiteIds } from "@/lib/api-user";
import { HOUR, rateLimit, tooMany } from "@/lib/rate-limit";
import { STATUS_PAGE_LIMIT } from "@/lib/features/limits";
import { slugProblem } from "@/lib/status-pages/slug";
import { statusPageBody } from "@/lib/status-pages/schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const a = await apiUser();
  if ("res" in a) return a.res;
  const pages = await prisma.statusPage.findMany({ where: { userId: a.user.id }, orderBy: { createdAt: "asc" } });
  return NextResponse.json({ pages }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(req: Request) {
  const a = await apiUser(req);
  if ("res" in a) return a.res;
  if (a.user.admin) return bad("Admin accounts can't create status pages.", 403);
  const lim = await rateLimit([{ key: `sp-add:${a.user.id}`, limit: 20, windowMs: HOUR }]);
  if (!lim.ok) return tooMany(lim.retryAfterSec);
  const parsed = statusPageBody.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return bad("Add a title, an address and at least one site.");
  const d = parsed.data;
  const problem = slugProblem(d.slug);
  if (problem) return bad(problem);
  const count = await prisma.statusPage.count({ where: { userId: a.user.id } });
  if (count >= STATUS_PAGE_LIMIT[a.user.plan]) return bad(`Your plan includes ${STATUS_PAGE_LIMIT[a.user.plan]} status page${STATUS_PAGE_LIMIT[a.user.plan] === 1 ? "" : "s"}. Upgrade for more.`, 403);
  const siteIds = await ownedSiteIds(a.user.id, d.siteIds);
  if (!siteIds.length) return bad("Pick at least one of your sites.");
  if (await prisma.statusPage.findUnique({ where: { slug: d.slug }, select: { id: true } })) return bad("That address is taken. Try another.", 409);
  const page = await prisma.statusPage.create({
    data: { userId: a.user.id, title: d.title, slug: d.slug, description: d.description || null, siteIds, published: d.published },
  });
  revalidatePath(`/status/${page.slug}`);
  return NextResponse.json({ page }, { status: 201 });
}
