/** Markdown files are imported as plain strings (webpack asset/source, see next.config.mjs). */
declare module "*.md" {
  const content: string;
  export default content;
}
