"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/** Time in the viewer's zone. Server and first paint show UTC, so there is no hydration mismatch. */
export function LocalTime({ iso, dateOnly = false }: { iso: string; dateOnly?: boolean }) {
  const local = useSyncExternalStore(subscribe, () => true, () => false);
  const d = new Date(iso);
  const opts: Intl.DateTimeFormatOptions = dateOnly
    ? { day: "numeric", month: "short", year: "numeric" }
    : { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" };
  const text = local ? d.toLocaleString(undefined, opts) : `${d.toLocaleString("en-GB", { ...opts, timeZone: "UTC" })} UTC`;
  return <time dateTime={iso} suppressHydrationWarning>{text}</time>;
}
