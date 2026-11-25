/**
 * ECG-style checking pulse in logo blue. CSS stroke-dashoffset only; no JS or
 * extra deps. The marketing HeartbeatVisual is a ping history chart, so this
 * trace follows the same IconPulse language instead.
 */
export function CheckPulse() {
  return (
    <svg
      viewBox="0 0 320 56"
      className="mx-auto h-14 w-full max-w-md text-[#1F6FEB]"
      fill="none"
      aria-hidden
    >
      <path d="M0 28 H320" className="ecg-baseline" stroke="currentColor" strokeWidth="1" />
      <path
        d="M0 28 H36 C40 28 42 20 46 20 C50 20 52 28 56 28 H72 L76 32 L80 28 L86 4 L94 50 L100 28 C108 28 112 16 120 16 C128 16 132 28 140 28 H160 H196 C200 28 202 20 206 20 C210 20 212 28 216 28 H232 L236 32 L240 28 L246 4 L254 50 L260 28 C268 28 272 16 280 16 C288 16 292 28 300 28 H320"
        className="ecg-trace"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
        pathLength="100"
      />
    </svg>
  );
}
