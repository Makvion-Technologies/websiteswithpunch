"use client";

import { useState } from "react";
import type { ClientHb } from "@/lib/heartbeats/types";
import type { PlanId } from "@/lib/plans";
import { HeartbeatCard } from "./HeartbeatCard";
import { HeartbeatForm } from "./HeartbeatForm";
import { useNow } from "./parts";

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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-display text-xl font-medium text-ink">Heartbeats</h2>
          <p className="mt-1 text-sm text-muted">
            Cron jobs and scheduled tasks · {list.length}/{limit} used
          </p>
        </div>
        <div>{button}</div>
      </div>
      {list.length === 0 ? (
        <div className="mt-5 border border-dashed border-rule bg-bg p-8 text-center">
          <h3 className="font-display text-lg font-medium text-ink">Know when a scheduled job stops running</h3>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted">
            Backups, invoices, imports: create a heartbeat, add one curl line to the job, and we email you if a run is missed.
          </p>
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
