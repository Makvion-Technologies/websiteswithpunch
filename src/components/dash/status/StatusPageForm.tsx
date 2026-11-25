"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/Toast";
import { slugify } from "@/lib/status-pages/slug";
import { Dialog } from "@/components/dash/Dialog";
import { SitePicker, type PickSite } from "@/components/dash/SitePicker";
import { BTN_PRIMARY, BTN_SECONDARY, ERROR, FIELD } from "@/components/dash/ui";

export type ClientStatusPage = { id: string; title: string; slug: string; description: string | null; siteIds: string[]; published: boolean };

/** Create or edit a status page in one step: name, address, sites. */
export function StatusPageForm({ initial, sites, origin, onClose }: { initial?: ClientStatusPage; sites: PickSite[]; origin: string; onClose: () => void }) {
  const router = useRouter();
  const { toast } = useToast();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugEdited, setSlugEdited] = useState(Boolean(initial));
  const [description, setDescription] = useState(initial?.description ?? "");
  const [siteIds, setSiteIds] = useState<string[]>(initial?.siteIds ?? sites.map((s) => s.id).slice(0, 50));
  const [published, setPublished] = useState(initial?.published ?? true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function onTitle(v: string) {
    setTitle(v);
    if (!slugEdited) setSlug(slugify(v));
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!siteIds.length) return setError("Pick at least one site.");
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(initial ? `/api/status-pages/${initial.id}` : "/api/status-pages", {
        method: initial ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, slug, description, siteIds, published }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) return setError(data.error || "Something went wrong.");
      toast(initial ? "Status page saved." : "Status page is live.", "success");
      onClose();
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog title={initial ? "Edit status page" : "New status page"} description="A public page with live status and 90 days of uptime for the sites you choose." onClose={onClose} busy={busy} wide>
      <form onSubmit={submit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="sp-title" className="block text-sm font-medium text-ink">Name</label>
            <input id="sp-title" value={title} onChange={(e) => onTitle(e.target.value)} required minLength={2} maxLength={80} placeholder="Acme Inc." className={FIELD} />
          </div>
          <div>
            <label htmlFor="sp-slug" className="block text-sm font-medium text-ink">Address</label>
            <div className="mt-1 flex border border-rule bg-bg focus-within:border-accent">
              <span className="hidden shrink-0 items-center border-r border-rule px-2 text-xs text-muted sm:flex">/status/</span>
              <input
                id="sp-slug"
                value={slug}
                onChange={(e) => {
                  setSlugEdited(true);
                  setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""));
                }}
                required
                maxLength={40}
                placeholder="acme"
                className="min-w-0 flex-1 bg-transparent px-3 py-2 font-mono text-sm text-ink placeholder:text-muted/70 focus:outline-none"
              />
            </div>
            <p className="mt-1 truncate text-xs text-muted">{origin}/status/{slug || "your-name"}</p>
          </div>
        </div>
        <div>
          <label htmlFor="sp-desc" className="block text-sm font-medium text-ink">Short description <span className="font-normal text-muted">(optional)</span></label>
          <input id="sp-desc" value={description} onChange={(e) => setDescription(e.target.value)} maxLength={240} placeholder="Live status of our website, shop and API." className={FIELD} />
        </div>
        <div>
          <p className="mb-1 text-sm font-medium text-ink">Sites to show</p>
          <SitePicker sites={sites} value={siteIds} onChange={setSiteIds} idPrefix="sp-site" />
        </div>
        <label className="flex items-center gap-2 text-sm text-ink">
          <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} className="h-4 w-4 accent-[hsl(var(--accent))]" />
          Published (anyone with the link can see it)
        </label>
        {error && <p className={ERROR} role="alert">{error}</p>}
        <div className="flex flex-wrap gap-3">
          <button type="submit" disabled={busy} className={BTN_PRIMARY}>{busy ? "Saving…" : initial ? "Save changes" : "Publish page"}</button>
          <button type="button" disabled={busy} onClick={onClose} className={BTN_SECONDARY}>Cancel</button>
        </div>
      </form>
    </Dialog>
  );
}
