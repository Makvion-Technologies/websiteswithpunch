"use client";

import { useState } from "react";

export type PickSite = { id: string; name: string; url: string };

/** Checkbox list of the user's sites with a filter box once there are more than 8. */
export function SitePicker({ sites, value, onChange, idPrefix }: { sites: PickSite[]; value: string[]; onChange: (ids: string[]) => void; idPrefix: string }) {
  const [q, setQ] = useState("");
  const shown = q ? sites.filter((s) => `${s.name} ${s.url}`.toLowerCase().includes(q.toLowerCase())) : sites;
  const all = sites.length > 0 && value.length === sites.length;
  const toggle = (id: string) => onChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id]);
  if (!sites.length) return <p className="text-sm text-muted">Add a site first, then pick it here.</p>;
  return (
    <div className="border border-rule bg-bg">
      <div className="flex items-center justify-between gap-2 border-b border-rule px-3 py-2">
        {sites.length > 8 ? (
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter sites…" aria-label="Filter sites" className="min-w-0 flex-1 bg-transparent text-sm text-ink placeholder:text-muted/70 focus:outline-none" />
        ) : (
          <span className="text-xs text-muted">{value.length} of {sites.length} selected</span>
        )}
        <button type="button" onClick={() => onChange(all ? [] : sites.map((s) => s.id))} className="shrink-0 text-xs font-medium text-accent hover:underline">
          {all ? "Clear" : "Select all"}
        </button>
      </div>
      <ul className="max-h-52 overflow-y-auto py-1">
        {shown.map((s) => (
          <li key={s.id}>
            <label htmlFor={`${idPrefix}-${s.id}`} className="flex cursor-pointer items-center gap-2.5 px-3 py-1.5 hover:bg-accent-soft">
              <input id={`${idPrefix}-${s.id}`} type="checkbox" checked={value.includes(s.id)} onChange={() => toggle(s.id)} className="h-4 w-4 accent-[hsl(var(--accent))]" />
              <span className="min-w-0 truncate text-sm text-ink">{s.name}</span>
              <span className="ml-auto hidden truncate text-xs text-muted sm:inline">{s.url.replace(/^https?:\/\//, "")}</span>
            </label>
          </li>
        ))}
        {!shown.length && <li className="px-3 py-2 text-sm text-muted">No sites match.</li>}
      </ul>
    </div>
  );
}
