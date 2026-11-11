import Link from "next/link";
import { InAppBackLink } from "@/components/InAppBackLink";
import { RailLinks } from "@/components/layout/RailLinks";
import { SplitLayout } from "@/components/layout/SplitLayout";

/** Shared layout and text pieces for /terms, /privacy, /refund-policy and /cookie-policy. */
export const LEGAL_LINKS = [
  { label: "Terms of Service", href: "/terms" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Refund & Cancellation Policy", href: "/refund-policy" },
  { label: "Cookie Policy", href: "/cookie-policy" },
] as const;

export const SUPPORT_EMAIL = "hello@websiteswithpunch.com";

export function LegalPage({
  title,
  updated,
  path,
  children,
}: {
  title: string;
  updated: string;
  path: string;
  children: React.ReactNode;
}) {
  const others = LEGAL_LINKS.filter((l) => l.href !== path).map((l) => ({ href: l.href, title: l.label }));
  const aside = (
    <>
      <RailLinks title="Other policies" links={others} />
      <RailLinks
        title="Questions?"
        links={[{ href: "/contact?topic=general", title: "Contact us", body: "We aim to reply within 1–2 business days." }]}
      />
    </>
  );
  return (
    <SplitLayout aside={aside} className="py-16" relative>
      <InAppBackLink />
      <h1 className="font-display text-3xl font-medium text-ink">{title}</h1>
      <p className="mt-2 text-sm text-muted">Last updated: {updated}</p>
      <div className="mt-8 space-y-6 leading-relaxed text-ink">{children}</div>
    </SplitLayout>
  );
}

export function H2({ children, id }: { children: React.ReactNode; id?: string }) {
  return <h2 id={id} className="scroll-mt-24 font-display text-xl font-medium text-ink">{children}</h2>;
}

export function P({ children }: { children: React.ReactNode }) {
  return <p className="text-muted">{children}</p>;
}

export function UL({ children }: { children: React.ReactNode }) {
  return <ul className="list-disc space-y-2 pl-5 text-muted">{children}</ul>;
}

export function A({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link className="text-accent underline underline-offset-2 hover:no-underline" href={href}>
      {children}
    </Link>
  );
}

/** Who runs the service, and how to reach us: the same closing block on every legal page. */
export function LegalContact({ lead = "Questions?" }: { lead?: string }) {
  return (
    <>
      <H2>Contact</H2>
      <P>
        Websites With Punch is operated by <strong>Makvion Technologies</strong>, based in India.
      </P>
      <P>
        {lead} Use our <A href="/contact?topic=general">contact form</A> or write to{" "}
        {SUPPORT_EMAIL}. We aim to reply within 1–2 business days.
      </P>
    </>
  );
}
