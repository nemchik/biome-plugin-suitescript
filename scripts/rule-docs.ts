// Writes one page per plugin rule to docs/rules/ from the rule data in scripts/rule-sources.ts, the
// manifest and a real run of the rule on a test fixture. Run `npm run build` first, then `npm run docs`.
import {
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { fileURLToPath } from "node:url";
import { EXAMPLES } from "../test/cases.ts";
import { lint, rule } from "../test/helpers.ts";
import {
  ADR,
  RULES,
  type RuleInfo,
  type Source,
  TIER_ZERO,
  VERIFICATION,
  VERIFICATIONS,
} from "./rule-sources.ts";
import { severityOf } from "./rules-table.ts";

const root = new URL("../", import.meta.url);
const PRESETS = ["minimal", "recommended", "all"] as const;

const NOTICE = `<!--
  This page is generated. Do not edit it by hand: manual edits will be rejected.
  To change it, edit the rule's entry in scripts/rule-sources.ts (description, sources,
  opt-in reason) or the fixture and cases in test/cases.ts, then run \`npm run build\`
  and \`npm run docs\` and commit the result. See docs/rule-priority.md.
-->`;

const link = (source: Source) => `[${source.label}](${source.url})`;

/** The first diagnostic the rule reports on its example fixture, as the flagged line and message. */
function example(name: string): string {
  const fixture = EXAMPLES[name];
  if (!fixture) throw new Error(`${name} has no example in test/cases.ts`);
  const out = lint(rule(name), fixture);
  const head = new RegExp(
    `^${fixture.replace(".", "\\.")}:(\\d+):\\d+ plugin`,
    "m",
  ).exec(out);
  if (!head) throw new Error(`${name} reports nothing on ${fixture}`);
  const line = Number(head[1]);
  const after = out.slice(head.index);
  const message = /^\s+([!×]) (.+)$/m.exec(after);
  const source = readFileSync(new URL(`test/fixtures/${fixture}`, root), "utf8")
    .split(/\r?\n/)
    [line - 1]?.replace(/\t/g, "  ")
    .trim();
  const lang = fixture.endsWith(".ts") ? "ts" : "js";
  const level = message?.[1] === "×" ? "error" : "warning";
  return [
    `\`\`\`${lang}`,
    source ?? "",
    "```",
    "",
    `Reported as ${level}: ${message?.[2]} (\`${fixture}\`, line ${line}).`,
  ].join("\n");
}

function page(
  name: string,
  info: RuleInfo,
  presets: readonly string[],
): string {
  const severity = severityOf(name);
  const decisions = TIER_ZERO[name] ?? [];
  const sources = [
    ...decisions.map((a) => `- Tier 0: [ADR ${a.slice(0, 4)}](${ADR}${a}.md)`),
    ...info.sources.map((s) => `- Tier ${s.tier}: ${link(s)}`),
    ...(VERIFICATIONS[name] ?? []).map(
      (v) => `- Verified: [${v}](${VERIFICATION}${v}.md)`,
    ),
  ];
  const where = presets.length > 0 ? presets.join(", ") : "none (opt-in)";
  return [
    NOTICE,
    "",
    `# \`${name}\``,
    "",
    `${info.description}.`,
    "",
    `- **Severity:** ${severity}`,
    `- **Presets:** ${where}`,
    ...(info.optIn ? [`- **Opt-in:** ${info.optIn}`] : []),
    "",
    "## Example",
    "",
    "Flagged when this rule alone is enabled:",
    "",
    example(name),
    "",
    "## Rule source",
    "",
    ...sources,
    "",
    `Enable it with \`"plugins": ["biome-plugin-suitescript/${name}"]\` or through a preset. See the [README](https://github.com/nemchik/biome-plugin-suitescript#readme).`,
    "",
  ].join("\n");
}

/** Every page as `file name -> content`. */
export function pages(): Record<string, string> {
  const manifest = JSON.parse(
    readFileSync(new URL("biome-manifest.json", root), "utf8"),
  ) as { plugins: { presets: Record<string, string[]> } };
  const out: Record<string, string> = {};
  for (const [name, info] of Object.entries(RULES)) {
    const presets = PRESETS.filter((p) =>
      manifest.plugins.presets[p]?.includes(name),
    );
    out[`${name}.md`] = page(name, info, presets);
  }
  return out;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const dir = new URL("docs/rules/", root);
  rmSync(dir, { force: true, recursive: true });
  mkdirSync(dir, { recursive: true });
  const all = pages();
  for (const [file, content] of Object.entries(all)) {
    writeFileSync(new URL(file, dir), content);
  }
  console.log(`${readdirSync(dir).length} rule pages written`);
}
