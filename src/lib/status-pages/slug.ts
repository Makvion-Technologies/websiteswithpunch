/** Status page slugs: 3–40 chars, a–z, 0–9 and single hyphens. Pure (unit tested). */
export const SLUG_RE = /^[a-z0-9](?:[a-z0-9]|-(?=[a-z0-9])){2,39}$/;

const RESERVED = new Set(["admin", "api", "app", "dashboard", "login", "signup", "status", "www", "help", "support", "billing", "new", "edit", "websiteswithpunch", "wwp"]);

export function slugify(raw: string): string {
  return raw
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40)
    .replace(/-+$/g, "");
}

export function slugProblem(slug: string): string | null {
  if (!SLUG_RE.test(slug)) return "Use 3–40 letters, numbers or single hyphens.";
  if (RESERVED.has(slug)) return "That address is reserved. Try another.";
  return null;
}
