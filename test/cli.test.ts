import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const bin = join(root, "dist/bin/biome-plugin-suitescript.js");

function run(args: string[], cwd = root) {
  const r = spawnSync(process.execPath, [bin, ...args], {
    cwd,
    encoding: "utf8",
  });
  return { code: r.status, err: r.stderr, out: r.stdout };
}

const fx = (name: string) => `test/fixtures/${name}`;

test("clean files exit 0", () => {
  const r = run(["check", fx("tags-ok.js"), fx("lib.ts")]);
  assert.equal(r.code, 0);
  assert.match(r.out, /No problems found/);
});

test("modules from the wrong side of the declared script type are reported", () => {
  const r = run(["check", fx("tags-side.js")]);
  assert.equal(r.code, 1);
  assert.match(r.out, /modules {2}N\/file is only available in server scripts/);
  assert.doesNotMatch(r.out, /N\/currentRecord is only/);
});

test("old version, bad entry points and missing tags exit 1", () => {
  const r = run(["check", fx("tags-bad.js"), fx("tags-missing.ts")]);
  assert.equal(r.code, 1);
  assert.match(r.out, /@NApiVersion must be 2\.1, found '2\.x'/);
  assert.match(r.out, /does not support returned entry point execute/);
  assert.match(
    r.out,
    /Missing @NScriptType tag; the returned entry points imply UserEventScript/,
  );
  assert.match(r.out, /Missing @NApiVersion 2\.1 tag/);
  assert.match(r.out, /netsuite-suitescript-upgrade/);
});

test("callbacks that cannot be analysed statically are not flagged", () => {
  assert.equal(run(["check", fx("factory-callback.js")]).code, 0);
});

test("libraries without tags are skipped", () => {
  assert.equal(run(["check", fx("lib.ts")]).code, 0);
});

test("json and github formats", () => {
  const json = JSON.parse(
    run(["check", fx("tags-bad.js"), "--format", "json"]).out,
  );
  assert.equal(json.diagnostics[0].rule, "apiVersion");
  assert.equal(json.hints.length, 1);
  const gh = run(["check", fx("tags-bad.js"), "--format", "github"]).out;
  assert.match(
    gh,
    /^::error file=test\/fixtures\/tags-bad\.js,line=2,col=4,title=suitescript\/apiVersion::/,
  );
});

test("reads includes from the config file and refuses to guess", () => {
  const dir = mkdtempSync(join(tmpdir(), "bps-cli-"));
  assert.equal(run(["check"], dir).code, 2);
  writeFileSync(
    join(dir, "biome-plugin-suitescript.json"),
    JSON.stringify({ includes: ["**/*.js", "!skip.js"] }),
  );
  writeFileSync(join(dir, "a.js"), "/** @NApiVersion 2.0 */\n");
  writeFileSync(join(dir, "skip.js"), "/** @NApiVersion 2.0 */\n");
  const r = run(["check", "--format", "json"], dir);
  assert.equal(r.code, 1);
  assert.deepEqual(
    JSON.parse(r.out).diagnostics.map((d: { file: string }) => d.file),
    ["a.js"],
  );
  assert.equal(run(["check", "nomatch/**"], dir).code, 2);
});

test("generate module-vars writes a self-contained rule", () => {
  const dir = mkdtempSync(join(tmpdir(), "bps-gen-"));
  const out = join(dir, "module-vars.js");
  const r = run([
    "generate",
    "module-vars",
    "--set",
    "N/record=nRecord",
    "--out",
    out,
  ]);
  assert.equal(r.code, 0);
  const source = readFileSync(out, "utf8");
  assert.match(source, /"N\/record": "nRecord"/);
  assert.doesNotMatch(source, /^import .*\.js"/m);
});
