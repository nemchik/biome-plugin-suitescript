// Writes the README rules table from the rule data in scripts/rule-sources.ts, the
// manifest and the preset configs. Run `npm run build` first, then `npm run readme`.
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { NATIVE_RULES } from "./native-rules.ts";
import {
  ADR,
  BIOME,
  NATIVE_INFO,
  RULE_PAGES,
  RULES,
  type Source,
  TIER_ZERO,
} from "./rule-sources.ts";

const root = new URL("../", import.meta.url);
const read = (path: string) => readFileSync(new URL(path, root), "utf8");

export const START = "<!-- rules-table:start -->";
export const END = "<!-- rules-table:end -->";

const PRESETS = ["minimal", "recommended", "all"] as const;
const EMOJI = {
  all: ":large_blue_circle:",
  minimal: ":white_circle:",
  recommended: ":green_circle:",
} as const;
const OPT_IN = ":key:";

interface Row {
  tier: number;
  severity: "error" | "warn";
  rank: number;
  name: string;
  cells: string[];
}

/** Whether a rule's diagnostics are errors, read from its source. */
export function severityOf(name: string): "error" | "warn" {
  const dir = new URL("src/rules/", root);
  const file = readdirSync(dir).find((f) => f.split(".")[0] === name);
  if (!file) throw new Error(`No rule file for ${name}`);
  const text = readFileSync(new URL(file, dir), "utf8");
  if (file.endsWith(".grit")) {
    return /severity="error"/.test(text) ? "error" : "warn";
  }
  const levels = [
    ...text.matchAll(/registerDiagnostic\(\s*[^,]+,\s*"(\w+)"/g),
  ].map((m) => m[1]);
  return levels.includes("error") ? "error" : "warn";
}

const link = (source: Source) => `[${source.label}](${source.url})`;

function sourceCell(name: string, sources: Source[]): string {
  const parts: string[] = [];
  const decisions = TIER_ZERO[name];
  if (decisions) {
    const links = decisions.map((a) => `[ADR ${a.slice(0, 4)}](${ADR}${a}.md)`);
    parts.push(`Tier 0: ${links.join(", ")}`);
  }
  for (const tier of [1, 2, 3, 4, 5]) {
    const own = sources.filter((s) => s.tier === tier);
    if (own.length > 0) parts.push(`Tier ${tier}: ${own.map(link).join(", ")}`);
  }
  return parts.join(" · ");
}

function presetCell(included: readonly string[]): {
  cell: string;
  rank: number;
} {
  const ranks = PRESETS.filter((p) => included.includes(p));
  return {
    cell: ranks.map((p) => EMOJI[p]).join("") || OPT_IN,
    rank:
      ranks.length > 0
        ? PRESETS.indexOf(ranks[0] as (typeof PRESETS)[number])
        : 3,
  };
}

function rows(): Row[] {
  const manifest = JSON.parse(read("biome-manifest.json")) as {
    plugins: { presets: Record<string, string[]> };
  };
  const configs = Object.fromEntries(
    PRESETS.map((p) => [
      p,
      JSON.parse(read(`configs/${p}.json`)) as {
        linter: { rules: Record<string, Record<string, string>> };
      },
    ]),
  );
  const out: Row[] = [];

  const files = readdirSync(new URL("src/rules/", root)).map(
    (f) => f.split(".")[0],
  );
  for (const name of files) {
    if (name && !(name in RULES)) {
      throw new Error(`${name} is missing from scripts/rule-sources.ts`);
    }
  }

  for (const [name, info] of Object.entries(RULES)) {
    const included = PRESETS.filter((p) =>
      manifest.plugins.presets[p]?.includes(name),
    );
    const { cell, rank } = presetCell(included);
    const description = info.optIn
      ? `${info.description}. **Opt-in, in no preset: ${info.optIn}**`
      : info.description;
    const severity = severityOf(name);
    out.push({
      cells: [
        `[\`${name}\`](${RULE_PAGES}${name}.md)`,
        severity,
        cell,
        description,
        sourceCell(name, info.sources),
      ],
      name,
      rank,
      severity,
      tier: Math.min(...info.sources.map((s) => s.tier)),
    });
  }

  for (const rule of NATIVE_RULES) {
    const info = NATIVE_INFO[rule.name];
    if (!info) throw new Error(`${rule.name} is missing from NATIVE_INFO`);
    const included = PRESETS.filter(
      (p) => (rule.presets as readonly string[]).includes(p) && configs[p],
    );
    const { cell, rank } = presetCell(included);
    const severity = rule.severity === "error" ? "error" : "warn";
    out.push({
      cells: [
        `\`${rule.name}\` (Biome)`,
        severity,
        cell,
        info.description,
        `Tier 5: [Biome \`${rule.name}\`](${BIOME}${info.slug}/)`,
      ],
      name: rule.name,
      rank,
      severity,
      tier: 5,
    });
  }

  return out.sort(
    (a, b) =>
      a.tier - b.tier ||
      Number(a.severity !== "error") - Number(b.severity !== "error") ||
      a.rank - b.rank ||
      a.name.localeCompare(b.name),
  );
}

/** The rules table as markdown. */
export function renderTable(): string {
  const header = ["Rule", "Severity", "Presets", "Description", "Rule source"];
  const body = rows().map((r) => r.cells);
  const widths = header.map((_, i) =>
    Math.max(...[header, ...body].map((r) => (r[i] ?? "").length)),
  );
  const format = (cells: string[]) =>
    `| ${cells.map((c, i) => c.padEnd(widths[i] ?? 0)).join(" | ")} |`;
  return [
    format(header),
    `| ${widths.map((w) => "-".repeat(w)).join(" | ")} |`,
    ...body.map(format),
  ].join("\n");
}

/** README text with the table between the markers replaced. */
export function withTable(readme: string): string {
  const start = readme.indexOf(START);
  const end = readme.indexOf(END);
  if (start < 0 || end < start) {
    throw new Error(`README.md needs ${START} and ${END} markers`);
  }
  return `${readme.slice(0, start + START.length)}\n\n${renderTable()}\n\n${readme.slice(end)}`;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const path = new URL("README.md", root);
  writeFileSync(path, withTable(readFileSync(path, "utf8")));
  console.log("README rules table written");
}
