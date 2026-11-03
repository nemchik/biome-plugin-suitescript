import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const read = (file: string) => readFileSync(root + file, "utf8");

const PRESETS = ["minimal", "recommended", "all"] as const;
const SHORTCODES = {
  all: ":large_blue_circle:",
  minimal: ":white_circle:",
  recommended: ":green_circle:",
} as const;
const OPT_IN = ":key:";

type Config = { linter: { rules: Record<string, Record<string, string>> } };

/** Native Biome rules a config turns on (set to anything but `off`). */
function nativeRules(preset: (typeof PRESETS)[number]): Set<string> {
  const config = JSON.parse(read(`configs/${preset}.json`)) as Config;
  const names = new Set<string>();
  for (const group of Object.values(config.linter.rules)) {
    if (typeof group !== "object") continue;
    for (const [rule, severity] of Object.entries(group)) {
      if (severity !== "off") names.add(rule);
    }
  }
  return names;
}

const ruleName = (cell: string | undefined) =>
  /`(\w+)`/.exec(cell ?? "")?.[1] ?? "";

test("the README rules table lists the presets each rule belongs to", () => {
  const manifest = JSON.parse(read("biome-manifest.json")) as {
    plugins: {
      presets: Record<string, string[]>;
      rules: Record<string, string>[];
    };
  };
  const { presets, rules } = manifest.plugins;
  const rows = read("README.md")
    .split(/\r?\n/)
    .filter((line) => /^\| `\w+`/.test(line))
    .map((line) => line.split("|").map((cell) => cell.trim()));
  assert.ok(rows.length > 0, "rules table not found");

  for (const cells of rows) {
    const rule = ruleName(cells[1]);
    const native = / \(Biome\)$/.test(cells[1] ?? "");
    const names = PRESETS.filter((preset) =>
      native ? nativeRules(preset).has(rule) : presets[preset]?.includes(rule),
    ).map((preset) => SHORTCODES[preset]);
    const expected = names.length > 0 ? names.join("") : OPT_IN;
    assert.equal(cells[3], expected, `Presets cell for ${rule}`);
  }

  const listed = new Set(rows.map((cells) => ruleName(cells[1])));
  for (const entry of rules) {
    for (const rule of Object.keys(entry)) {
      assert.ok(listed.has(rule), `${rule} is missing from the README table`);
    }
  }
});

test("the README rules table is sorted by tier, severity, preset and name", () => {
  const tierOf = (source: string) =>
    Number(/^Tier (\d)/.exec(source)?.[1] ?? 9);
  const rows = read("README.md")
    .split(/\r?\n/)
    .filter((line) => /^\| `\w+`/.test(line))
    .map((line) => line.split("|").map((cell) => cell.trim()));
  const keys = rows.map((cells) => [
    tierOf(cells[5] ?? ""),
    cells[2] === "error" ? 0 : 1,
  ]);
  for (let i = 1; i < keys.length; i++) {
    const [tier, severity] = keys[i] ?? [];
    const [previousTier, previousSeverity] = keys[i - 1] ?? [];
    assert.ok(
      (tier ?? 0) > (previousTier ?? 0) ||
        ((tier ?? 0) === previousTier &&
          (severity ?? 0) >= (previousSeverity ?? 0)),
      `${ruleName(rows[i]?.[1])} is out of order`,
    );
  }
});
