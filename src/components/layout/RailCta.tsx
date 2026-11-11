import Link from "next/link";

/** Small sidebar signup card. Claims stay within what the product does. */
export function RailCta({ title = "Monitor your site free", body }: { title?: string; body: string }) {
  return (
    <div className="border border-rule bg-surface p-5">
      <p className="font-display text-lg font-medium tracking-tight text-ink">{title}</p>
      <p className="mt-2 text-sm leading-relaxed text-muted">{body}</p>
      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
        <Link href="/signup" className="inline-flex items-center bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover">
          Start free
        </Link>
        <Link href="/pricing" className="text-sm text-muted underline-offset-4 hover:text-ink hover:underline">
          See pricing
        </Link>
      </div>
    </div>
  );
}
