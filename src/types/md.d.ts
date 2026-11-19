/** Markdown files are imported as plain strings (Turbopack "raw" rule in next.config.mjs). */
declare module "*.md" {
  const content: string;
  export default content;
}
