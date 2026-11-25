import type { Prisma } from "@prisma/client";
import { activityWhere } from "@/lib/activity/status";
import { usersWhere, USER_PLANS } from "./filters";

export const USER_SORTS = { joined: "Newest", active: "Last active", login: "Last login", sites: "Most sites", email: "Email A–Z" } as const;
export type UserSort = keyof typeof USER_SORTS;
export const USER_ACTIVITY = ["today", "week", "month", "dormant"] as const;

export type UserQuery = { q?: string; plan?: string; act?: string; sort: UserSort; country?: string };

export function parseUserQuery(sp: Record<string, string | undefined>): UserQuery {
  const q = (sp.q ?? "").trim().slice(0, 100) || undefined;
  const plan = (USER_PLANS as readonly string[]).includes(sp.plan ?? "") ? sp.plan : undefined;
  const act = (USER_ACTIVITY as readonly string[]).includes(sp.act ?? "") ? sp.act : undefined;
  const sort = (sp.sort && sp.sort in USER_SORTS ? sp.sort : "joined") as UserSort;
  const country = /^[A-Za-z]{2}$/.test(sp.country ?? "") ? sp.country!.toUpperCase() : undefined;
  return { q, plan, act, sort, country };
}

export function userListWhere(o: UserQuery, now = Date.now()): Prisma.UserWhereInput {
  const base = usersWhere({ plan: o.plan });
  const and: Prisma.UserWhereInput[] = [base, activityWhere(o.act, now) as Prisma.UserWhereInput];
  if (o.q) {
    and.push({
      OR: [
        { email: { contains: o.q, mode: "insensitive" } },
        { name: { contains: o.q, mode: "insensitive" } },
        { lastCity: { contains: o.q, mode: "insensitive" } },
        ...(o.q.length === 2 ? [{ lastCountry: o.q.toUpperCase() }] : []),
        { signupSource: { contains: o.q, mode: "insensitive" } },
      ],
    });
  }
  if (o.country) and.push({ lastCountry: o.country });
  return { AND: and };
}

export function userOrder(sort: UserSort): Prisma.UserOrderByWithRelationInput[] {
  switch (sort) {
    case "active": return [{ lastActiveAt: { sort: "desc", nulls: "last" } }, { createdAt: "desc" }];
    case "login": return [{ lastLoginAt: { sort: "desc", nulls: "last" } }, { createdAt: "desc" }];
    case "sites": return [{ sites: { _count: "desc" } }, { createdAt: "desc" }];
    case "email": return [{ email: "asc" }];
    default: return [{ createdAt: "desc" }];
  }
}

export const USER_ROW_SELECT = {
  id: true, email: true, name: true, plan: true, dodoStatus: true, cancelAtPeriodEnd: true, createdAt: true,
  lastActiveAt: true, lastLoginAt: true, lastCountry: true, lastCity: true, lastDevice: true, signupSource: true,
  _count: { select: { sites: true } },
} satisfies Prisma.UserSelect;
export type UserRow = Prisma.UserGetPayload<{ select: typeof USER_ROW_SELECT }>;
