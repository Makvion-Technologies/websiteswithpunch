/**
 * A deliberately tiny markdown subset for blog posts, parsed at build time (no dependency):
 * ## / ### headings, paragraphs, "- " and "1. " lists, ``` code fences, | tables |,
 * "> " callouts (first word in bold becomes the label), and "::fig name" for a figure.
 * Inline: `code`, **bold**, *emphasis* and [label](/path or https://…).
 */
export type Block =
  | { t: "h2" | "h3"; text: string; id: string }
  | { t: "p"; text: string }
  | { t: "ul" | "ol"; items: string[] }
  | { t: "code"; lang: string; code: string }
  | { t: "table"; head: string[]; rows: string[][] }
  | { t: "callout"; label: string; text: string[] }
  | { t: "fig"; name: string };

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/`|\*\*/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

/** Table cells; "\\|" is a literal pipe inside a cell. */
const cells = (line: string) =>
  line
    .trim()
    .replace(/^\||\|$/g, "")
    .split(/(?<!\\)\|/)
    .map((c) => c.trim().replace(/\\\|/g, "|"));

export function parseMarkdown(src: string): Block[] {
  const lines = src.replace(/\r\n/g, "\n").split("\n");
  const out: Block[] = [];
  let para: string[] = [];
  const flush = () => {
    if (para.length) out.push({ t: "p", text: para.join(" ") });
    para = [];
  };
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const s = line.trim();
    if (!s) {
      flush();
      continue;
    }
    if (s.startsWith("```")) {
      flush();
      const code: string[] = [];
      while (++i < lines.length && !lines[i].trim().startsWith("```")) code.push(lines[i]);
      out.push({ t: "code", lang: s.slice(3).trim(), code: code.join("\n") });
      continue;
    }
    const h = /^(#{2,3}) (.+)$/.exec(s);
    if (h) {
      flush();
      out.push({ t: h[1].length === 2 ? "h2" : "h3", text: h[2], id: slugify(h[2]) });
      continue;
    }
    if (s.startsWith("::fig ")) {
      flush();
      out.push({ t: "fig", name: s.slice(6).trim() });
      continue;
    }
    if (s.startsWith(">")) {
      flush();
      const text: string[] = [];
      for (; i < lines.length && lines[i].trim().startsWith(">"); i++) text.push(lines[i].trim().replace(/^>\s?/, ""));
      i--;
      const m = /^\*\*([^*]+?):?\*\*:?\s*/.exec(text[0] ?? "");
      if (m) text[0] = text[0].slice(m[0].length);
      out.push({ t: "callout", label: m ? m[1] : "Note", text: text.filter(Boolean) });
      continue;
    }
    if (s.startsWith("|")) {
      flush();
      const rows: string[][] = [];
      for (; i < lines.length && lines[i].trim().startsWith("|"); i++) rows.push(cells(lines[i]));
      i--;
      const [head, , ...body] = rows;
      out.push({ t: "table", head, rows: body });
      continue;
    }
    const li = /^(- |\d+\. )/.exec(s);
    if (li) {
      flush();
      const ordered = li[1] !== "- ";
      const items: string[] = [];
      for (; i < lines.length; i++) {
        const m = /^(- |\d+\. )(.*)$/.exec(lines[i].trim());
        if (m && (m[1] !== "- ") === ordered) items.push(m[2]);
        else if (lines[i].startsWith("  ") && lines[i].trim() && items.length) items[items.length - 1] += " " + lines[i].trim();
        else break;
      }
      i--;
      out.push({ t: ordered ? "ol" : "ul", items });
      continue;
    }
    para.push(s);
  }
  flush();
  return out;
}

/** Plain text of the body (for word counts). */
export function plainText(src: string) {
  return src
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/::fig .+/g, " ")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[#>*`|]/g, " ");
}

export function wordCount(src: string) {
  return plainText(src).split(/\s+/).filter((w) => /[a-z0-9]/i.test(w)).length;
}

/** Minutes to read at about 230 words a minute (code blocks excluded). */
export const readingMinutes = (src: string) => Math.max(1, Math.round(wordCount(src) / 230));

export const headings = (blocks: Block[]) =>
  blocks.filter((b): b is Extract<Block, { id: string }> => b.t === "h2").map((b) => ({ id: b.id, text: b.text.replace(/`|\*\*/g, "") }));

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
/** "2026-11-11" → "Nov 11, 2026" without locale APIs, so server and client always agree. */
export function formatDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return `${MONTHS[m - 1]} ${d}, ${y}`;
}
