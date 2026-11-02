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
const WITH_LOG_MODULE = [...ALL, "biome-plugin-suitescript/noLogModule"];
const count = (out: string) => (out.match(/plugin ━/g) ?? []).length;

test("AMD problems are reported", () => {
  const out = lint(WITH_LOG_MODULE, "bad.js");
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
  const out = lint(WITH_LOG_MODULE, "es.ts");
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

test("rules drawn from Oracle's agent skills report what they should", () => {
  const out = lint(ALL, "skills-bad.js");
  for (const msg of [
    "'email' is used but N/email is not loaded",
    "'log' shadows the global log",
    "Do not use eval()",
    "Do not pass a string to setTimeout()",
    "Build SuiteQL with \\? placeholders",
    "'nlapiGetContext' is SuiteScript 1.0",
    "record.load\\(\\) runs at module scope",
    "record.load\\(\\) inside a loop",
    "Avoid generator functions",
    "Avoid Symbol.iterator",
  ]) {
    assert.match(out, new RegExp(msg), msg);
  }
  assert.equal(
    (out.match(/Build SuiteQL/g) ?? []).length,
    2,
    "concatenation and template literal are both flagged",
  );
  assert.equal(
    (out.match(/inside a loop/g) ?? []).length,
    2,
    "for-of and forEach are both flagged",
  );
});

test("compliant skills code is not flagged", () => {
  assert.equal(count(lint(ALL, "skills-good.js")), 0);
});

test("noMissingModules requires N/log when log is used", () => {
  const out = lint(
    ["biome-plugin-suitescript/noMissingModules"],
    "missing-log.js",
  );
  assert.match(out, /'log' is used but N\/log is not loaded/);
});

test("modules are checked against the inferred script side", () => {
  const client = lint(ALL, "side-client.js");
  assert.match(client, /N\/file is only available in server scripts/);
  assert.doesNotMatch(client, /N\/currentRecord is only/);
  const server = lint(ALL, "side-server.js");
  assert.match(server, /N\/currentRecord is only available in client scripts/);
  assert.match(server, /N\/ui\/dialog is only available in client scripts/);
  assert.doesNotMatch(server, /N\/record is only/);
});

test("browser globals are flagged in server scripts only when unbound", () => {
  const out = lint(ALL, "side-server.js");
  assert.match(out, /'document' does not exist in server scripts/);
  assert.doesNotMatch(out, /'window' does not exist/);
});

test("beforeSubmit reload of the saved record and empty entry points", () => {
  const out = lint(ALL, "ue.js");
  assert.match(out, /not allowed in beforeSubmit/);
  assert.equal((out.match(/not allowed in beforeSubmit/g) ?? []).length, 1);
  assert.match(out, /Entry point 'afterSubmit' is empty/);
});

test("getInputData returning search results is flagged", () => {
  const out = lint(ALL, "mr-search.js");
  assert.equal(
    (out.match(/Return the search object from getInputData/g) ?? []).length,
    1,
    "only the getInputData return, not the unrelated arrow",
  );
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
