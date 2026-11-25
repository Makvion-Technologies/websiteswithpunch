import { proofMetrics } from "./home-content";

export function ProofStrip() {
  return (
    <section className="bg-solid text-solid-fg" aria-label="What we cover">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-px sm:grid-cols-4">
        {proofMetrics.map((m, i) => (
          <div
            key={m.label}
            className={`px-4 py-8 sm:px-6 sm:py-10 ${i > 0 ? "border-l border-solid-fg/15" : ""} ${i >= 2 ? "border-t border-solid-fg/15 sm:border-t-0" : ""}`}
          >
            <p className="font-display text-lg font-medium sm:text-xl">{m.label}</p>
            <p className="mt-1 text-sm text-solid-fg/65">{m.detail}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
