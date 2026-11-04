// Regenerates the rule mapping table in docs/migrating-from-eslint.md from the ESLint plugin
// sources recorded in scripts/rule-sources.ts. The rest of that page is hand-written; only the
// text between the markers below is generated. Run `npm run build` first, then `npm run docs`.
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { RULE_PAGES, RULES } from "./rule-sources.ts";

export const BEGIN = "<!-- BEGIN GENERATED TABLE -->";
export const END = "<!-- END GENERATED TABLE -->";

const guide = new URL("../docs/migrating-from-eslint.md", import.meta.url);

/** One row per ESLint rule that a rule here was ported from, sorted by plugin then rule. */
export function table(): string {
  const rows: { plugin: string; rule: string; ours: string[] }[] = [];
  for (const [name, info] of Object.entries(RULES)) {
    for (const source of info.sources) {
      if (!source.eslint) continue;
      const { plugin, rule } = source.eslint;
      let row = rows.find((r) => r.plugin === plugin && r.rule === rule);
      if (!row) {
        row = { ours: [], plugin, rule };
        rows.push(row);
      }
      row.ours.push(name);
    }
  }
  rows.sort((a, b) =>
    a.plugin === b.plugin
      ? a.rule.localeCompare(b.rule)
      : a.plugin.localeCompare(b.plugin),
  );
  const lines = [
    "| ESLint plugin | ESLint rule | Rule here |",
    "| --- | --- | --- |",
    ...rows.map(
      (r) =>
        `| ${r.plugin} | \`${r.rule}\` | ${r.ours
          .sort()
          .map((n) => `[\`${n}\`](${RULE_PAGES}${n}.md)`)
          .join(", ")} |`,
    ),
  ];
  return lines.join("\n");
}

/** The guide with its generated table replaced. */
export function render(text: string): string {
  const start = text.indexOf(BEGIN);
  const end = text.indexOf(END);
  if (start === -1 || end === -1 || end < start) {
    throw new Error(`docs/migrating-from-eslint.md needs ${BEGIN} and ${END}`);
  }
  return `${text.slice(0, start + BEGIN.length)}\n\n${table()}\n\n${text.slice(end)}`;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const text = readFileSync(guide, "utf8").replace(/\r\n/g, "\n");
  writeFileSync(guide, render(text));
  console.log("Migration table written");
}
