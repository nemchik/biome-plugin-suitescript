import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  cpSync,
  mkdirSync,
  mkdtempSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const biomeBin = join(root, "node_modules/@biomejs/biome/bin/biome");

/** Lints a fixture the way a consumer would: the built package installed in node_modules. */
function lint(plugins: string[], fixture: string): string {
  const dir = mkdtempSync(join(tmpdir(), "bps-"));
  mkdirSync(join(dir, "node_modules/@biomejs"), { recursive: true });
  symlinkSync(
    root,
    join(dir, "node_modules/biome-plugin-suitescript"),
    "junction",
  );
  symlinkSync(
    join(root, "node_modules/@biomejs/runtime"),
    join(dir, "node_modules/@biomejs/runtime"),
    "junction",
  );
  writeFileSync(
    join(dir, "biome.json"),
    JSON.stringify({ linter: { enabled: true }, plugins }),
  );
  cpSync(join(root, "test/fixtures", fixture), join(dir, fixture));
  const r = spawnSync(
    process.execPath,
    [biomeBin, "lint", "--only=plugin", fixture],
    {
      cwd: dir,
      encoding: "utf8",
    },
  );
  return r.stdout + r.stderr;
}

const ALL = ["biome-plugin-suitescript/presets/all"];
const count = (out: string) => (out.match(/plugin ━/g) ?? []).length;

test("AMD problems are reported", () => {
  const out = lint(ALL, "bad.js");
  for (const msg of [
    "No AMD module name",
    "Invalid NetSuite module 'N/bogus'",
    "should not include file extension",
    "Excess module name",
    "Identifier for N/record should be 'record'",
    "A log title is required",
    "Log details are required",
    "Use global log",
  ]) {
    assert.match(out, new RegExp(msg), msg);
  }
});

test("ES import/export problems are reported", () => {
  const out = lint(ALL, "es.ts");
  for (const msg of [
    "Use global log",
    "Identifier for N/record should be 'record'",
    "Log details are required with 'log.debug'",
    "Invalid NetSuite module 'N/bogus'",
    "do not belong to a single script type",
  ]) {
    assert.match(out, new RegExp(msg), msg);
  }
});

test("script type is inferred and required entry points are checked", () => {
  const out = lint(ALL, "mr.js");
  assert.match(out, /MapReduceScript requires entry point map or reduce/);
  assert.match(out, /map, onRequest do not belong to a single script type/);
  assert.equal(count(out), 2, "valid map/reduce script must not be flagged");
});

test("libraries are never flagged", () => {
  assert.equal(count(lint(ALL, "lib.ts")), 0);
});

test("N/types is a valid module", () => {
  assert.doesNotMatch(lint(ALL, "types-module.js"), /Invalid NetSuite module/);
});

test("minimal preset is quiet on good.js", () => {
  assert.equal(
    count(lint(["biome-plugin-suitescript/presets/minimal"], "good.js")),
    0,
  );
});
