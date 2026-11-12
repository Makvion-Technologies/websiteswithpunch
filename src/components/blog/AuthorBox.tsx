import Image from "next/image";
import Link from "next/link";
import { contactHref } from "@/lib/contact";
import { AUTHOR } from "@/lib/blog/meta";

/** Who wrote this and how it was checked (the "who" and "how" of Google's helpful-content guidance). */
export function AuthorBox() {
  return (
    <aside aria-label="About these guides" className="flex gap-4 border border-rule bg-surface p-5 sm:p-6">
      <Image src="/logo.svg" alt="" width={48} height={48} unoptimized className="h-12 w-12 shrink-0 object-contain" />
      <div className="min-w-0">
        <p className="font-display text-lg font-medium tracking-tight text-ink">{AUTHOR.name}</p>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          These guides are written and maintained by the team that builds the uptime, SSL and domain expiry monitor on
          this site. Each one is checked against the primary sources it names (RFCs, ICANN policy, the
          CA/Browser Forum, Let&apos;s Encrypt and Google&apos;s own documentation) and updated when they change. Spotted
          a mistake?{" "}
          <Link href={contactHref("general")} className="font-medium text-ink underline decoration-accent/40 underline-offset-4 hover:decoration-accent">
            Let us know
          </Link>
          .
        </p>
      </div>
    </aside>
  );
}
