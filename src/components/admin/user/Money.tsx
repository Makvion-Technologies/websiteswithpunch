import Link from "next/link";
import { fmtUsd } from "@/lib/referrals/config";
import type { UserDetail } from "@/lib/admin/user-detail";
import { Badge, Panel, fmtDate } from "../ui";
import { Row } from "./Profile";

/** Referral program: code, referrer, balances, payouts, commissions; plus payments seen via referrals. */
export function MoneyPanel({ d }: { d: UserDetail }) {
  const { user: u, totals: t } = d;
  return (
    <Panel title="Referrals & payouts">
      <dl className="divide-y divide-rule">
        <Row k="Referral code">{u.referralCode ? <span className="font-mono text-xs">{u.referralCode}</span> : null}{u.referralCode ? ` · ${u.referralClicks} clicks · ${u._count.referrals} sign-ups` : ""}</Row>
        <Row k="Referred by">{u.referredBy ? <Link href={`/admin/users/${u.referredBy.id}`} className="hover:text-accent">{u.referredBy.email}</Link> : null}</Row>
        <Row k="Payout to">{u.payoutAddress ? `${u.payoutMethod === "upi" ? "UPI" : "PayPal"} · ${u.payoutAddress}` : null}</Row>
      </dl>
      {t && (
        <div className="grid grid-cols-3 gap-px border-y border-rule bg-rule text-center">
          {([["Available", t.withdrawable], ["Requested", t.requested], ["Paid", t.paid]] as const).map(([k, v]) => (
            <div key={k} className="bg-surface px-2 py-2.5"><p className="text-[11px] text-muted">{k}</p><p className="font-medium tabular-nums text-ink">{fmtUsd(v)}</p></div>
          ))}
        </div>
      )}
      <List title="Payouts" empty="None." rows={d.payouts.map((p) => ({ id: p.id, href: `/admin/payouts?tab=all&p=${p.id}`, left: `${fmtDate(p.createdAt, false)} · ${p.method === "upi" ? "UPI" : "PayPal"}`, badge: p.status, amount: fmtUsd(p.amountCents) }))} />
      <List title="Commissions earned" empty="None." rows={d.commissions.map((c) => ({ id: c.id, left: `${fmtDate(c.createdAt, false)} · ${c.referredUser?.email ?? "deleted user"}`, badge: c.status === "pending" ? "available" : c.status, amount: fmtUsd(c.amountCents) }))} />
      <List title="Payments (referral-tracked)" empty="None tracked. Full billing history is in Dodo under the customer id." rows={d.paidFor.map((c) => ({ id: c.id, left: `${fmtDate(c.createdAt, false)} · ${c.paymentId}`, badge: c.status, amount: `${(c.baseCents / 100).toFixed(2)} ${c.currency}` }))} />
    </Panel>
  );
}

type R = { id: string; href?: string; left: string; badge: string; amount: string };
function List({ title, rows, empty }: { title: string; rows: R[]; empty: string }) {
  return (
    <>
      <h3 className="label-caps border-b border-rule px-4 py-2 [&:not(:first-child)]:border-t">{title}</h3>
      {rows.length === 0 ? <p className="px-4 py-3 text-sm text-muted">{empty}</p> : (
        <ul className="divide-y divide-rule">
          {rows.map((r) => {
            const body = (
              <>
                <span className="min-w-0 flex-1 truncate text-muted">{r.left}</span>
                <Badge tone={r.badge === "paid" ? "ok" : r.badge === "reversed" || r.badge === "rejected" ? "danger" : "muted"}>{r.badge}</Badge>
                <span className="w-24 text-right tabular-nums text-ink">{r.amount}</span>
              </>
            );
            return <li key={r.id}>{r.href ? <Link href={r.href} className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-accent-soft">{body}</Link> : <div className="flex items-center gap-2 px-4 py-2 text-sm">{body}</div>}</li>;
          })}
        </ul>
      )}
    </>
  );
}
