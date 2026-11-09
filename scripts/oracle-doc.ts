// Prints the full text of an Oracle help-centre page, with tags stripped.
// WebFetch summarises, so it can not satisfy "read Oracle docs in full".
//
//   npm run oracle-doc -- section_4387799721
//   npm run oracle-doc -- 4387799721
//   npm run oracle-doc -- https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_4387799721.html

const HELP_BASE =
  "https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/";

const ENTITIES: Record<string, string> = {
  amp: "&",
  apos: "'",
  gt: ">",
  lt: "<",
  nbsp: " ",
  quot: '"',
};

/** Turns a section id (`section_123` or `123`) or an Oracle docs URL into a page URL. */
export function resolveUrl(input: string): string {
  const value = input.trim();
  if (/^https?:\/\//i.test(value)) {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.hostname !== "docs.oracle.com") {
      throw new Error(
        `Only https://docs.oracle.com pages are supported: ${value}`,
      );
    }
    return url.href;
  }
  const id = /^(?:section_)?(\d+)(?:\.html)?$/.exec(value);
  if (!id) {
    throw new Error(
      `Expected a section id (section_123 or 123) or a docs.oracle.com URL, got: ${value}`,
    );
  }
  return `${HELP_BASE}section_${id[1]}.html`;
}

/** A comment, a whole script-like element, or any single tag, matched in one alternation. */
const TAG =
  /<!--[\s\S]*?-->|<(script|style|noscript|svg)\b[\s\S]*?<\/\1\s*>|<[^>]*>/gi;
const BLOCK_END =
  /^<\/(?:p|div|h[1-6]|li|tr|table|ul|ol|pre|section|article)\s*>$|^<br\s*\/?>$/i;
const CELL_END = /^<\/t[dh]\s*>$/i;

/** Strips tags and scripts from a page and keeps block structure as line breaks. */
export function htmlToText(html: string): string {
  const body = /<body[^>]*>([\s\S]*)<\/body>/i.exec(html)?.[1] ?? html;
  return body
    .replace(TAG, (token) => {
      // One pass over the markup: a removed piece can never join its
      // neighbours into a new tag, which chained replaces allow.
      if (BLOCK_END.test(token)) return "\n";
      if (CELL_END.test(token)) return "\t";
      return "";
    })
    .replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, entity: string) => {
      if (entity[0] === "#") {
        const code =
          entity[1] === "x" || entity[1] === "X"
            ? Number.parseInt(entity.slice(2), 16)
            : Number.parseInt(entity.slice(1), 10);
        return Number.isNaN(code) ? match : String.fromCodePoint(code);
      }
      return ENTITIES[entity.toLowerCase()] ?? match;
    })
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

async function main(): Promise<void> {
  const input = process.argv[2];
  if (!input) {
    console.error(
      "Usage: npm run oracle-doc -- <section id | docs.oracle.com URL>",
    );
    process.exitCode = 2;
    return;
  }
  try {
    const url = resolveUrl(input);
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`${url} returned HTTP ${response.status}`);
    }
    const text = htmlToText(await response.text());
    if (!text) throw new Error(`${url} returned no text`);
    console.log(text);
  } catch (error) {
    console.error(
      `oracle-doc failed: ${error instanceof Error ? error.message : String(error)}`,
    );
    process.exitCode = 1;
  }
}

if (process.argv[1] === import.meta.filename) await main();
