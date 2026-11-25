"use client";

import { ToolForm } from "@/components/tools/ToolForm";

/** Live down check for one known site. Starts once after mount; Check again re-runs it. */
export function IsDownCheck({ host, name }: { host: string; name: string }) {
  return (
    <ToolForm
      kind="down"
      label="Website"
      placeholder={host}
      button="Check now"
      initial={host}
      locked
      autorun
      checkingLabel={`Checking ${name}…`}
    />
  );
}
