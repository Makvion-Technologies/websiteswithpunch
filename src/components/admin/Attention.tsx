import Link from "next/link";
import { NewPill } from "./NewPill";
import { Panel } from "./ui";
import { fmtUsd } from "@/lib/referrals/config";
import type { overviewStats } from "@/lib/admin/overview";

const n = (v: number) => v.toLocaleString("en-US");

type S = Awaited<ReturnType<typeof overviewStats>>;

/** Only what needs a human: open payouts, changed amounts, sites down, unanswered messages. */
export function Attention({ s, fresh }: { s: S; fresh: Record<string, number> }) {
  const items: Array<{ key: string; href: string; text: React.ReactNode; danger?: boolean; fresh?: number }> = [];
  if (s.openPayouts) items.push({ key: "p", fresh: fresh["payouts:requested"], href: "/admin/payouts?tab=requested", text: <>{n(s.openPayouts)} payout request{s.openPayouts === 1 ? "" : "s"} · <b className="font-medium tabular-nums">{fmtUsd(s.openPayoutCents)}</b> to pay</> });
  for (const p of s.changed) items.push({ key: `c${p.id}`, href: `/admin/payouts?p=${p.id}`, danger: true, text: <>Amount changed for {p.user.email}: was {fmtUsd(p.requestedCents ?? 0)}, now <b className="font-medium">{fmtUsd(p.amountCents)}</b></> });
  if (s.down) items.push({ key: "d", fresh: fresh["sites:down"], href: "/admin/sites?status=down", danger: true, text: <>{n(s.down)} site{s.down === 1 ? "" : "s"} down: {s.downList.map((d) => d.name).join(", ")}{s.down > s.downList.length ? "…" : ""}</> });
  if (s.ssl) items.push({ key: "s", fresh: fresh["sites:ssl"], href: "/admin/sites?status=ssl", text: <>{n(s.ssl)} SSL certificate{s.ssl === 1 ? "" : "s"} expiring within 30 days</> });
  if (s.domain) items.push({ key: "o", fresh: fresh["sites:domain"], href: "/admin/sites?status=domain", text: <>{n(s.domain)} domain{s.domain === 1 ? "" : "s"} expiring within 30 days</> });
  if (s.unread) items.push({ key: "m", fresh: fresh["messages:open"], href: "/admin/messages", text: <>{n(s.unread)} open message{s.unread === 1 ? "" : "s"}</> });
  return (
    <Panel title="Needs attention">
      {items.length === 0 ? <p className="px-4 py-4 text-sm text-muted">All clear. Nothing waiting on you.</p> : (
        <ul className="divide-y divide-rule">
          {items.map((i) => (
            <li key={i.key}>
              <Link href={i.href} className={`flex items-center gap-3 px-4 py-3 text-sm hover:bg-accent-soft ${i.danger ? "text-danger" : "text-ink"} ${(i.fresh ?? 0) > 0 ? `font-semibold shadow-[inset_2px_0_0_#059669] ${i.danger ? "" : "!text-zinc-900 dark:!text-white"}` : ""}`}>
                <span className={`h-2 w-2 shrink-0 rounded-full ${i.danger ? "bg-danger" : "bg-accent"}`} />
                <span className="min-w-0 flex-1">{i.text}</span>
                <NewPill n={i.fresh ?? 0} />
                <span aria-hidden className="text-muted">→</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}
