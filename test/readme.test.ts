import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const read = (file: string) => readFileSync(root + file, "utf8");

const SHORTCODES = {
  all: ":blue_circle:",
  minimal: ":white_circle:",
  recommended: ":green_circle:",
} as const;
const OPT_IN = ":key:";

test("the README rules table lists the presets each rule belongs to", () => {
  const manifest = JSON.parse(read("biome-manifest.json")) as {
    plugins: { presets: Record<string, string[]> };
  };
  const { presets } = manifest.plugins;
  const rows = read("README.md")
    .split(/\r?\n/)
    .filter((line) => /^\| `\w+`/.test(line))
    .map((line) => line.split("|").map((cell) => cell.trim()));
  assert.ok(rows.length > 0, "rules table not found");

  for (const cells of rows) {
    const rule = /`(\w+)`/.exec(cells[1] ?? "")?.[1] ?? "";
    const names = (["minimal", "recommended", "all"] as const)
      .filter((preset) => presets[preset]?.includes(rule))
      .map((preset) => SHORTCODES[preset]);
    const expected = names.length > 0 ? names.join("") : OPT_IN;
    assert.equal(cells[3], expected, `Presets cell for ${rule}`);
  }

  const listed = new Set(
    rows.map((cells) => /`(\w+)`/.exec(cells[1] ?? "")?.[1] ?? ""),
  );
  for (const rule of Object.values(presets).flat()) {
    assert.ok(listed.has(rule), `${rule} is missing from the README table`);
  }
});
