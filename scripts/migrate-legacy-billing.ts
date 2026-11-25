/**
 * One-off, for the paid-only pricing launch. Dry run by default; nothing changes without a flag.
 *
 *   npx tsx --env-file=.env.production.local scripts/migrate-legacy-billing.ts            # report only
 *   npx tsx --env-file=.env.production.local scripts/migrate-legacy-billing.ts --reset-blocks
 *   npx tsx --env-file=.env.production.local scripts/migrate-legacy-billing.ts --book
 *
 * --reset-blocks  Run right after `prisma db push`, before the new code takes traffic: zeroes
 *                 sitePackCount / pendingSitePackCount / pendingPackChangeAt. Those columns now
 *                 hold Custom 25-site blocks; old site-pack counts must not be read as blocks.
 *                 (The next webhook/sync rewrites them from Dodo anyway.)
 * --book          For every subscription still on a retired item (old $42/$420 Business product
 *                 or an old site-pack add-on), books a Change Plan to the new product of the same
 *                 plan and interval, without add-ons, effective at next_billing_date. Nobody pays
 *                 more: new Business ($24, 100 sites) and Pro ($12, 30 sites) cover every old
 *                 plan + pack size. Subscriptions with a change already booked or a cancel pending
 *                 are skipped and listed.
 * Needs DATABASE_URL, DODO_PAYMENTS_API_KEY, DODO_PAYMENTS_ENVIRONMENT and every DODO_PRODUCT_* /
 * DODO_ADDON_* (new and legacy). Never prints secrets.
 */
import { prisma } from "../src/lib/prisma";
import { getDodo } from "../src/lib/dodo";
import { hasLegacyItems, subscriptionState } from "../src/lib/dodo-subscription";
import { changeBody } from "../src/lib/dodo-change";

const args = new Set(process.argv.slice(2));
const RESET = args.has("--reset-blocks");
const BOOK = args.has("--book");

async function resetBlocks() {
  const where = { OR: [{ sitePackCount: { gt: 0 } }, { pendingSitePackCount: { not: null } }, { pendingPackChangeAt: { not: null } }] };
  const n = await prisma.user.count({ where });
  console.log(`Users with old pack counts: ${n}`);
  if (!RESET || !n) return;
  const r = await prisma.user.updateMany({ where, data: { sitePackCount: 0, pendingSitePackCount: null, pendingPackChangeAt: null } });
  console.log(`Reset ${r.count} users.`);
}

async function bookLegacy() {
  const dodo = getDodo();
  if (!dodo) throw new Error("DODO_PAYMENTS_API_KEY is not set");
  const users = await prisma.user.findMany({
    where: { dodoSubscriptionId: { not: null }, plan: { in: ["pro", "business"] } },
    select: { id: true, plan: true, dodoSubscriptionId: true },
  });
  const rows: Record<string, string>[] = [];
  for (const u of users) {
    const sub = await dodo.subscriptions.retrieve(u.dodoSubscriptionId!);
    if (!hasLegacyItems(sub)) continue;
    const st = subscriptionState(sub);
    const row: Record<string, string> = { user: u.id, sub: sub.subscription_id, plan: String(st.plan), interval: String(st.interval), status: String(st.status) };
    if (!st.plan || !st.interval) row.result = "skip: product not mapped (check legacy env)";
    else if (st.cancelAtPeriodEnd) row.result = "skip: cancels at period end";
    else if (st.scheduled) row.result = "skip: a change is already booked";
    else if (!["active", "on_hold"].includes(String(st.status))) row.result = "skip: not active";
    else {
      const built = changeBody({ plan: st.plan, interval: st.interval, packs: 0 }, "renewal", st);
      if (!built.ok) row.result = `error: ${built.error}`;
      else if (!BOOK) row.result = "would book at next billing date";
      else {
        await dodo.subscriptions.changePlan(sub.subscription_id, built.body);
        row.result = "booked at next billing date";
      }
    }
    rows.push(row);
  }
  console.table(rows);
  console.log(`${rows.length} legacy subscription(s).${BOOK ? "" : " Dry run: pass --book to book them."}`);
}

async function main() {
  await resetBlocks();
  if (process.env.DODO_PAYMENTS_API_KEY) await bookLegacy();
  else console.log("No DODO_PAYMENTS_API_KEY: skipped the legacy subscription report.");
}

main()
  .catch((e) => {
    console.error(e instanceof Error ? e.message : e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
