"use client";

import { useState } from "react";
import type { ClientHb } from "@/lib/heartbeats/types";
import type { PlanId } from "@/lib/plans";
import { HeartbeatCard } from "./HeartbeatCard";
import { HeartbeatForm } from "./HeartbeatForm";
import { useNow } from "./parts";
import { BTN_PRIMARY, EmptyState } from "@/components/dash/ui";

/** Client half of the Heartbeats section: the New button, the cards and one shared clock. */
export function HeartbeatList({ list, plan, limit, serverNow }: { list: ClientHb[]; plan: PlanId; limit: number; serverNow: number }) {
  const now = useNow(serverNow);
  const [open, setOpen] = useState(false);
  const full = list.length >= limit;
  const button = full ? (
    <span className="border border-rule bg-accent-soft px-4 py-2 text-sm text-muted">Heartbeat limit reached</span>
  ) : (
    <button type="button" onClick={() => setOpen(true)} className="bg-solid px-4 py-2 text-sm font-medium text-solid-fg hover:opacity-90">
      New heartbeat
    </button>
  );
  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-medium text-ink">Cron jobs</h1>
          <p className="mt-1 text-sm text-muted">
            Heartbeat monitoring for backups and scheduled tasks · {list.length}/{limit} used
          </p>
        </div>
        <div>{button}</div>
      </div>
      {list.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            icon="cron"
            title="Know when a scheduled job stops running"
            text="Backups, invoices, imports: create a heartbeat, add one curl line to the job, and we alert you if a run is missed."
            action={full ? undefined : <button type="button" onClick={() => setOpen(true)} className={BTN_PRIMARY}>Create your first heartbeat</button>}
          />
        </div>
      ) : (
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          {list.map((hb) => (
            <HeartbeatCard key={hb.id} hb={hb} plan={plan} now={now} />
          ))}
        </div>
      )}
      {open && <HeartbeatForm open onClose={() => setOpen(false)} plan={plan} />}
    </>
  );
}
