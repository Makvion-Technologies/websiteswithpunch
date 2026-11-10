import Link from "next/link";
import { POPULAR_DOWN } from "@/content/is-down";

/** Points the tools hub at the programmatic “Is X down?” pages. */
export function IsDownPromo() {
  return (
    <section className="border-b border-rule bg-bg">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <p className="label-caps text-accent">Popular sites</p>
        <h2 className="mt-3 font-display text-3xl font-medium text-ink sm:text-4xl">Is Instagram down? Gmail? IRCTC?</h2>
        <p className="mt-3 max-w-2xl text-muted">
          Ready-made pages for 150+ well-known sites. Each one checks live from our server when you press the button.
        </p>
        <ul className="mt-8 flex flex-wrap gap-2">
          {POPULAR_DOWN.map((s) => (
            <li key={s.host}>
              <Link
                href={`/is-down/${s.host}`}
                className="inline-flex min-h-11 items-center border border-rule bg-surface px-3 text-sm text-ink hover:bg-bg"
              >
                Is {s.name} down?
              </Link>
            </li>
          ))}
        </ul>
        <Link href="/is-down" className="mt-6 inline-flex text-sm font-medium text-accent hover:underline">
          See every site we cover →
        </Link>
      </div>
    </section>
  );
}
