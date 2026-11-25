import { AlertsCta } from "@/components/marketing/AlertsCta";
import { DomainResultView, DownResultView, SslResultView } from "./result-views";
import { CheckPulse } from "./CheckPulse";
import { byCadence } from "@/lib/monitor/config";

export type ToolKind = "ssl" | "domain" | "down";
type Data = Record<string, unknown>;

/** Result card for the public checkers, with a soft "monitor it" link under every answer. */
export function ToolResult({ kind, data }: { kind: ToolKind; data: Data }) {
  const host = String(data.host ?? "");
  return (
    <div className="mt-6 border-t border-rule pt-6">
      {kind === "ssl" && <SslResultView d={data} />}
      {kind === "domain" && <DomainResultView d={data} />}
      {kind === "down" && <DownResultView d={data} />}
      {host ? (
        <div className="mt-6">
          <AlertsCta host={host} lead={`Monitor ${host} ${byCadence("around the clock", "every day")} and get an email when something needs attention.`} />
        </div>
      ) : null}
    </div>
  );
}

export function ToolResultSkeleton({ label = "Checking…" }: { label?: string }) {
  return (
    <div
      className="mt-6 flex min-h-[11.5rem] flex-col justify-center border-t border-rule pt-6"
      aria-busy="true"
      aria-live="polite"
      aria-label={label}
    >
      <CheckPulse />
      <p className="ecg-loader-label mt-3 text-center text-sm font-medium text-ink">{label}</p>
    </div>
  );
}
