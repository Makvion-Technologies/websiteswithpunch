"use client";

import { useEffect, type ReactNode } from "react";
import { DIALOG_SCROLL, ModalPortal } from "@/components/ModalPortal";

/** Centred form dialog (full width on phones). Escape and the backdrop close it unless busy. */
export function Dialog({ title, description, onClose, busy = false, wide = false, children }: { title: string; description?: ReactNode; onClose: () => void; busy?: boolean; wide?: boolean; children: ReactNode }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && !busy && onClose();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose, busy]);
  return (
    <ModalPortal>
      <div className="modal-fade fixed inset-0 z-[60] flex items-end justify-center bg-solid/40 sm:items-center sm:p-4" onClick={() => !busy && onClose()} role="presentation">
        <div
          role="dialog"
          aria-modal="true"
          aria-label={title}
          className={`${DIALOG_SCROLL} w-full ${wide ? "sm:max-w-2xl" : "sm:max-w-lg"} border border-rule bg-surface p-5 shadow-lg sm:p-6`}
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="font-display text-xl font-medium text-ink">{title}</h2>
          {description && <div className="mt-1 text-sm text-muted">{description}</div>}
          <div className="mt-5">{children}</div>
        </div>
      </div>
    </ModalPortal>
  );
}
