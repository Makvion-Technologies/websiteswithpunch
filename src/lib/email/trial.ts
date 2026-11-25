/** Starter free-trial emails: started, ending in 7 and 2 days, converted, upgraded during trial. */
import { escapeHtml, renderEmail, renderText } from "./layout";
import type { BuiltEmail } from "./templates";
import { SITE_URL } from "@/lib/site-config";

const PLAN_URL = `${SITE_URL}/plan`;
const REASON = "You're receiving this because you started a Websites With Punch Starter trial. Billing emails can't be turned off.";

export function fmtDate(d: Date): string {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
}

function build(o: { subject: string; heading: string; intro: string[]; notes: string[]; button?: string }): BuiltEmail {
  const label = o.button || "Open your plan";
  return {
    subject: o.subject,
    html: renderEmail({
      title: o.subject,
      preheader: o.intro[0],
      heading: o.heading,
      intro: o.intro.map(escapeHtml),
      button: { label, url: PLAN_URL },
      notes: o.notes.map(escapeHtml),
      reason: REASON,
    }),
    text: renderText([o.heading, ...o.intro, `${label}: ${PLAN_URL}`, ...o.notes, REASON]),
  };
}

/** `price` like "$5/month" or "$50/year". */
export function trialStartedEmail(endsAt: Date, price: string): BuiltEmail {
  return build({
    subject: "Your 30-day Starter trial has started",
    heading: "Your free trial is on",
    intro: [
      `You can monitor up to 10 sites with uptime, SSL and domain expiry checks. Your trial runs until ${fmtDate(endsAt)}.`,
      `Nothing was charged today. On ${fmtDate(endsAt)} your card is charged ${price} and Starter continues, unless you cancel before then from your plan page.`,
    ],
    notes: [
      "We'll email you 7 days and 2 days before the trial ends.",
      "Upgrading to Pro or Business during the trial ends the trial and charges the new plan's full price that day.",
    ],
    button: "Add your sites",
  });
}

export function trialEndingEmail(daysLeft: number, endsAt: Date, price: string): BuiltEmail {
  const when = daysLeft <= 2 ? "in 2 days" : "in 7 days";
  return build({
    subject: `Your Starter trial ends ${when} (${fmtDate(endsAt)})`,
    heading: `Your trial ends ${when}`,
    intro: [
      `Your Websites With Punch Starter trial ends on ${fmtDate(endsAt)}. Your card will then be charged ${price} and monitoring continues without a break.`,
      "Want to stop? Cancel from your plan page before that date and you won't be charged. Monitoring stops when the trial ends; your sites and history stay in your account.",
    ],
    notes: ["Payments are not refundable once charged, so please cancel before the date above if you don't want to continue."],
  });
}

export function trialConvertedEmail(price: string, nextAt: Date | null): BuiltEmail {
  return build({
    subject: "Your Starter plan is now active",
    heading: "Thanks for staying with us",
    intro: [
      `Your free trial ended and your first payment of ${price} went through. Starter is active${nextAt ? ` until ${fmtDate(nextAt)}, when it renews` : ""}.`,
      "Need more sites? Pro (30 sites) and Business (100 sites) are one click away on your plan page.",
    ],
    notes: ["Your invoice is in your plan page under Invoices."],
  });
}

export function trialUpgradedEmail(planName: string, price: string): BuiltEmail {
  return build({
    subject: `You're on ${planName} now`,
    heading: `Welcome to ${planName}`,
    intro: [
      `You upgraded during your Starter trial, so the trial has ended and ${planName} is active from today.`,
      `You were charged ${price} today, and the plan renews from today's date.`,
    ],
    notes: ["Your invoice is in your plan page under Invoices."],
  });
}
