import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { CUSTOM, clampBlocks, customSites, planDisplayName } from "@/lib/plans";
import { daysLeftInPeriod } from "@/lib/dodo-subscription";
import { applyChange, changeBody, previewBody, resync } from "@/lib/dodo-change";
import { blockIfScheduled, fail, withSubscription, type BillingCtx } from "@/lib/billing-route";
import { recurringBreakdown, recurringTotalCents } from "@/lib/billing-totals";
import { formatChargeToday, formatRecurringFromCents, formatShortDate } from "@/lib/billing-format";
import { setKeepOnDowngrade } from "@/lib/site-limits";
import { checkCustomCapacity } from "@/lib/monitor/capacity";
import { addsBlocksInWrongCurrency, CUSTOM_USD_ONLY_ERROR } from "@/lib/dodo-currency";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Custom size on Business (0 extra blocks = plain Business, 100 sites; up to 16 = 500 sites).
 * - Bigger: applies now with a prorated charge (Change Plan, prorated_immediately, prevent_change).
 * - Smaller: booked for the renewal date (next_billing_date + full_immediately); nothing is
 *   refunded or credited, the bigger size stays until then. If the smaller size is below the
 *   active site count, keepSiteIds picks the survivors.
 * GET ?blocks=N previews, POST { blocks, keepSiteIds? } applies, DELETE undoes a booked decrease.
 */
const schema = z.object({ blocks: z.number().int().min(0).max(CUSTOM.maxBlocks), keepSiteIds: z.array(z.string()).optional() });

function check(ctx: BillingCtx, blocks: number) {
  if (ctx.st.plan !== "business") {
    return fail(400, "Custom sizes build on Business. Upgrade to Business first.", "NOT_BUSINESS");
  }
  if (ctx.st.cancelAtPeriodEnd) return fail(400, "Your plan is set to end at renewal. Resume it first.");
  const blocked = blockIfScheduled(ctx.st, ["packs"]);
  if (blocked) return blocked;
  if (blocks === ctx.st.packs && !(ctx.st.scheduled && ctx.st.scheduled.packs < ctx.st.packs)) {
    return fail(400, `You're already on ${customSites(blocks)} sites.`);
  }
  if (addsBlocksInWrongCurrency(ctx.sub.currency, blocks, ctx.st.packs)) {
    return fail(409, CUSTOM_USD_ONLY_ERROR, "CUSTOM_USD_ONLY");
  }
  return null;
}

async function capacity(blocks: number, current: number) {
  if (blocks <= current) return null;
  const room = await checkCustomCapacity(blocks - current);
  if (room.ok) return null;
  const max = Math.max(current, room.maxBlocks);
  return fail(409, `We can take up to ${customSites(max)} sites right now. Pick a smaller size or contact us for more.`, "CAPACITY", {
    maxSites: customSites(max),
  });
}

export async function GET(req: Request) {
  const blocks = clampBlocks(Number(new URL(req.url).searchParams.get("blocks")));
  return withSubscription({ label: "resize preview" }, async (ctx) => {
    const bad = check(ctx, blocks);
    if (bad) return bad;
    const { dodo, sub, st, user } = ctx;
    const currency = sub.currency || "USD";
    const activeCount = await prisma.site.count({ where: { userId: user.id, locked: false } });
    const next = st.periodEnd?.toISOString() ?? null;
    const recurring = recurringTotalCents("business", blocks, st.interval);
    const base = {
      blocks,
      sites: customSites(blocks),
      name: planDisplayName("business", blocks),
      currentSites: customSites(st.packs),
      interval: st.interval,
      activeCount,
      daysLeftInPeriod: daysLeftInPeriod(st),
      newRecurringFormatted: formatRecurringFromCents(recurring, "usd", st.interval),
      recurringBreakdown: recurringBreakdown("business", blocks, st.interval),
    };
    if (blocks < st.packs) {
      return NextResponse.json({
        ...base,
        action: "decrease",
        amountDueTodayFormatted: formatChargeToday(0, currency),
        effectiveAt: next,
        effectiveAtFormatted: formatShortDate(next),
        needsKeepPicker: activeCount > customSites(blocks),
        maxKeep: customSites(blocks),
      });
    }
    if (blocks === st.packs) {
      // Undo a booked decrease: nothing is charged.
      return NextResponse.json({ ...base, action: "undo", amountDueTodayFormatted: formatChargeToday(0, currency) });
    }
    const full = await capacity(blocks, st.packs);
    if (full) return full;
    const built = changeBody({ plan: "business", interval: st.interval, packs: blocks }, "now", st);
    if (!built.ok) return fail(503, built.error, "PRICE_MISSING");
    const p = await dodo.subscriptions.previewChangePlan(sub.subscription_id, previewBody(built.body));
    const moved = p.new_plan.next_billing_date || next;
    return NextResponse.json({
      ...base,
      action: "increase",
      amountDueToday: p.immediate_charge.summary.total_amount,
      amountDueTodayFormatted: formatChargeToday(p.immediate_charge.summary.total_amount, currency),
      taxTodayFormatted: (p.immediate_charge.summary.tax ?? 0) > 0 ? formatChargeToday(p.immediate_charge.summary.tax ?? 0, currency) : null,
      nextRenewal: moved,
      nextRenewalFormatted: formatShortDate(moved),
    });
  });
}

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return fail(400, "Choose a size between 100 and 500 sites.");
  const { blocks, keepSiteIds = [] } = parsed.data;

  return withSubscription({ label: "resize", rateKey: "resize" }, async (ctx) => {
    const bad = check(ctx, blocks);
    if (bad) return bad;
    const { dodo, user, sub, st } = ctx;

    if (blocks === st.packs) {
      // A smaller size was booked; going back to the current size cancels it.
      await dodo.subscriptions.cancelChangePlan(sub.subscription_id);
      await resync(dodo, sub.subscription_id, user.id);
      await prisma.site.updateMany({ where: { userId: user.id }, data: { keepOnDowngrade: false } });
      return NextResponse.json({ ok: true, undone: true, sitePackCount: st.packs });
    }

    if (blocks < st.packs) {
      if (!st.periodEnd) return fail(500, "Could not determine your renewal date. Try again or open Manage billing.");
      const built = changeBody({ plan: "business", interval: st.interval, packs: blocks }, "renewal", st);
      if (!built.ok) return fail(503, built.error, "PRICE_MISSING");
      const newLimit = customSites(blocks);
      const activeCount = await prisma.site.count({ where: { userId: user.id, locked: false } });
      if (activeCount > newLimit) {
        if (keepSiteIds.length !== newLimit) {
          return fail(400, `Your plan will include ${newLimit} sites. Choose which ones stay active.`, "KEEP_REQUIRED", {
            maxKeep: newLimit,
            activeCount,
          });
        }
        const keep = await setKeepOnDowngrade(user.id, keepSiteIds, newLimit);
        if (!keep.ok) return NextResponse.json(keep, { status: 400 });
      }
      await dodo.subscriptions.changePlan(sub.subscription_id, built.body);
      await resync(dodo, sub.subscription_id, user.id);
      return NextResponse.json({
        ok: true,
        booked: true,
        sitePackCount: st.packs,
        pendingSitePackCount: blocks,
        effectiveAtFormatted: formatShortDate(st.periodEnd),
        newSites: newLimit,
      });
    }

    const full = await capacity(blocks, st.packs);
    if (full) return full;
    const built = changeBody({ plan: "business", interval: st.interval, packs: blocks }, "now", st);
    if (!built.ok) return fail(503, built.error, "PRICE_MISSING");
    const { applied, fresh } = await applyChange(dodo, sub.subscription_id, user.id, built.body, (f) => f.packs >= blocks);
    return NextResponse.json({ ok: true, pending: !applied, sitePackCount: applied ? fresh.packs : st.packs, newSites: customSites(blocks) });
  });
}
