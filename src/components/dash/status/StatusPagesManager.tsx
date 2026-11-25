"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/Toast";
import { ConfirmModal } from "@/components/ConfirmModal";
import { CopyLine } from "@/components/heartbeats/parts";
import type { PickSite } from "@/components/dash/SitePicker";
import { BTN_GHOST, BTN_PRIMARY, EmptyState } from "@/components/dash/ui";
import { StatusPageForm, type ClientStatusPage } from "./StatusPageForm";

type Props = { pages: ClientStatusPage[]; sites: PickSite[]; limit: number; origin: string };

export function StatusPagesManager({ pages, sites, limit, origin }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [editing, setEditing] = useState<ClientStatusPage | "new" | null>(null);
  const [removing, setRemoving] = useState<ClientStatusPage | null>(null);
  const [busy, setBusy] = useState(false);
  const full = pages.length >= limit;
  const newButton = (
    <button type="button" onClick={() => setEditing("new")} disabled={full || !sites.length} className={BTN_PRIMARY}>
      New status page
    </button>
  );

  async function remove() {
    if (!removing) return;
    setBusy(true);
    const res = await fetch(`/api/status-pages/${removing.id}`, { method: "DELETE", headers: { "Content-Type": "application/json" }, body: "{}" }).catch(() => null);
    setBusy(false);
    if (!res?.ok) return toast("Couldn't delete the page.", "error");
    setRemoving(null);
    toast("Status page deleted.", "success");
    router.refresh();
  }

  return (
    <>
      <div className="mt-6 flex items-center justify-between gap-3">
        <p className="text-sm text-muted">{pages.length}/{limit} pages on your plan</p>
        {pages.length > 0 && newButton}
      </div>
      {pages.length === 0 ? (
        <div className="mt-4">
          <EmptyState
            icon="status"
            title={sites.length ? "Share your uptime publicly" : "Add a site first"}
            text={sites.length ? "Give visitors or clients one link that answers “is it down?” with live status and 90 days of history. It updates on its own." : "Status pages show your monitored sites. Add one on the Monitors page, then come back."}
            action={sites.length ? newButton : undefined}
          />
        </div>
      ) : (
        <ul className="mt-4 grid grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-2">
          {pages.map((p) => {
            const url = `${origin}/status/${p.slug}`;
            return (
              <li key={p.id} className="flex min-w-0 flex-col border border-rule bg-surface">
                <div className="flex items-start justify-between gap-3 px-4 pt-4">
                  <div className="min-w-0">
                    <p className="truncate font-display text-base font-medium text-ink">{p.title}</p>
                    <p className="text-xs text-muted">
                      {p.siteIds.length} site{p.siteIds.length === 1 ? "" : "s"} · {p.published ? <span className="text-emerald-700 dark:text-emerald-300">Published</span> : "Hidden"}
                    </p>
                  </div>
                  <a href={`/status/${p.slug}`} target="_blank" rel="noopener" className="shrink-0 text-sm font-medium text-accent hover:underline">View ↗</a>
                </div>
                <div className="px-4 py-3">
                  <CopyLine text={url} label="status page link" />
                </div>
                <div className="mt-auto flex gap-1 border-t border-rule px-2 py-1.5">
                  <button type="button" onClick={() => setEditing(p)} className={BTN_GHOST}>Edit</button>
                  <button type="button" onClick={() => setRemoving(p)} className={`${BTN_GHOST} hover:text-danger`}>Delete</button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
      {editing && <StatusPageForm initial={editing === "new" ? undefined : editing} sites={sites} origin={origin} onClose={() => setEditing(null)} />}
      <ConfirmModal open={!!removing} onClose={() => setRemoving(null)} title={`Delete ${removing?.title ?? "page"}?`} loading={busy} onConfirm={remove}>
        The public link stops working within a minute. Your monitors are not affected.
      </ConfirmModal>
    </>
  );
}
