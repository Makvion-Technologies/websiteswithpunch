import type { BlogCategory } from "./types";

export const CATEGORIES: { id: BlogCategory; label: string; blurb: string }[] = [
  { id: "uptime", label: "Uptime", blurb: "Uptime targets, check intervals, downtime cost and status pages." },
  { id: "ssl", label: "SSL & HTTPS", blurb: "Certificate expiry, renewal and the shrinking certificate lifetimes." },
  { id: "domains", label: "Domains & DNS", blurb: "Domain renewals, the expiry timeline and DNS changes." },
  { id: "fixes", label: "Fixing outages", blurb: "Step-by-step fixes for the errors that take sites down." },
];

export const categoryLabel = (id: BlogCategory) => CATEGORIES.find((c) => c.id === id)?.label ?? id;
