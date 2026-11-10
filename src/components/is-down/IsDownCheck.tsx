"use client";

import { ToolForm } from "@/components/tools/ToolForm";

/** Live down check for one known site. Does not run until the visitor presses the button. */
export function IsDownCheck({ host }: { host: string }) {
  return (
    <ToolForm
      kind="down"
      label="Website"
      placeholder={host}
      button="Check now"
      initial={host}
      locked
    />
  );
}
