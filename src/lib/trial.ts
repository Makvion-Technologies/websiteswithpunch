/**
 * Starter free-trial bookkeeping. Dodo runs the trial (30 trial days on the Starter products,
 * Prevent Trial Misuse on); we mirror it onto the User row for copy and emails:
 * - trial seen on a Starter subscription → trialStartedAt / trialEndsAt / trialUsedAt + "started" email
 * - a mirrored trial that is no longer running on a paid subscription → trialConvertedAt +
 *   "converted" (first payment at trial end) or "upgraded" (Pro/Business bought during the trial)
 * - daily cron → "ends in 7 days" / "ends in 2 days" reminders.
 * Every email is claimed with a conditional update first, so retries and duplicate webhooks
 * never send twice.
 */
import { prisma } from "./prisma";
import { isPaidStatus, subscriptionState, type SubscriptionState } from "./dodo-subscription";
import { getDodo, isDodoConfigured } from "./dodo";
import { formatPlanPrice } from "./billing-interval";
import { PLANS, isPaidPlanId } from "./plans";
import { sendEmail } from "./email/send";
import { trialConvertedEmail, trialEndingEmail, trialStartedEmail, trialUpgradedEmail } from "./email/trial";

export const TRIAL_DAYS = 30;
const DAY = 86_400_000;

type TrialUser = {
  id: string;
  email: string;
  trialStartedAt: Date | null;
  trialEndsAt: Date | null;
  trialConvertedAt: Date | null;
};

export type TrialEvent = "started" | "converted" | "upgraded" | null;

/** Pure: what changed between our copy and the live subscription. */
export function trialTransition(
  user: Pick<TrialUser, "trialStartedAt" | "trialEndsAt" | "trialConvertedAt">,
  st: Pick<SubscriptionState, "plan" | "status" | "trialEndsAt">,
  nowMs = Date.now(),
): TrialEvent {
  if (st.trialEndsAt && st.plan === "starter") return user.trialStartedAt ? null : "started";
  if (user.trialEndsAt && !user.trialConvertedAt && !st.trialEndsAt && isPaidStatus(st.status)) {
    if (st.plan && st.plan !== "starter") return "upgraded";
    // Still Starter: only once the trial date has passed (Dodo charged at trial end).
    return nowMs >= user.trialEndsAt.getTime() - 3_600_000 ? "converted" : null;
  }
  return null;
}

async function send(to: string, mail: { subject: string; html: string; text: string }, tag: string) {
  const r = await sendEmail({ to, ...mail, tag });
  if (!r.sent && process.env.NODE_ENV === "production") console.warn(`[trial] ${tag} email not sent`, r.reason);
}

/** Called by syncSubscription after mirroring an active / past_due subscription. */
export async function applyTrialState(user: TrialUser, st: SubscriptionState, createdAt: Date | null): Promise<TrialEvent> {
  const event = trialTransition(user, st);
  if (!event || !st.plan || !isPaidPlanId(st.plan)) return event;
  const price = formatPlanPrice(st.plan, st.interval, st.packs);

  if (event === "started" && st.trialEndsAt) {
    const claimed = await prisma.user.updateMany({
      where: { id: user.id, trialStartedAt: null },
      data: {
        trialStartedAt: createdAt ?? new Date(),
        trialEndsAt: st.trialEndsAt,
        trialUsedAt: new Date(),
        trialReminder7At: null,
        trialReminder2At: null,
      },
    });
    if (claimed.count) await send(user.email, trialStartedEmail(st.trialEndsAt, price), "trial-started");
    return event;
  }

  const claimed = await prisma.user.updateMany({
    where: { id: user.id, trialConvertedAt: null },
    data: { trialConvertedAt: new Date() },
  });
  if (!claimed.count) return event;
  if (event === "upgraded") await send(user.email, trialUpgradedEmail(PLANS[st.plan].name, price), "trial-upgraded");
  else await send(user.email, trialConvertedEmail(price, st.periodEnd), "trial-converted");
  return event;
}

/** Daily cron: reminders 7 and 2 days before the trial ends (only while it's still on). */
export async function sendTrialReminders(now = new Date()): Promise<{ sent7: number; sent2: number }> {
  const users = await prisma.user.findMany({
    where: {
      trialEndsAt: { gt: now, lte: new Date(now.getTime() + 7 * DAY + DAY / 2) },
      trialConvertedAt: null,
      plan: "starter",
      cancelAtPeriodEnd: false,
      dodoStatus: "active",
    },
    select: { id: true, email: true, trialEndsAt: true, trialReminder7At: true, trialReminder2At: true, dodoSubscriptionId: true },
  });
  const dodo = isDodoConfigured() ? getDodo() : null;
  let sent7 = 0;
  let sent2 = 0;
  for (const u of users) {
    const end = u.trialEndsAt!;
    const left = (end.getTime() - now.getTime()) / DAY;
    const which = left <= 2.5 ? 2 : 7;
    if (which === 2 && u.trialReminder2At) continue;
    if (which === 7 && (u.trialReminder7At || u.trialReminder2At)) continue;
    // Confirm with Dodo that the trial is still on and read the price it will charge.
    let price = formatPlanPrice("starter", "month");
    if (dodo && u.dodoSubscriptionId) {
      try {
        const st = subscriptionState(await dodo.subscriptions.retrieve(u.dodoSubscriptionId));
        if (!st.trialEndsAt || st.cancelAtPeriodEnd || st.plan !== "starter") continue;
        price = formatPlanPrice("starter", st.interval);
      } catch (err) {
        console.warn("[trial] reminder: could not read subscription", u.id, err);
        continue;
      }
    }
    const claimed = await prisma.user.updateMany({
      where: which === 2 ? { id: u.id, trialReminder2At: null } : { id: u.id, trialReminder7At: null },
      data: which === 2 ? { trialReminder2At: now } : { trialReminder7At: now },
    });
    if (!claimed.count) continue;
    await send(u.email, trialEndingEmail(which, end, price), `trial-ending-${which}`);
    if (which === 2) sent2++;
    else sent7++;
  }
  return { sent7, sent2 };
}
