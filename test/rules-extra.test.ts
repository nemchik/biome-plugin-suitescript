import assert from "node:assert/strict";
import { test } from "node:test";
import { CASES } from "./cases.ts";
import { count, lint, rule } from "./helpers.ts";

for (const [name, fixture, expected] of CASES) {
  test(`${name} reports ${expected} in ${fixture}`, () => {
    assert.equal(count(lint(rule(name), fixture)), expected);
  });
}

const NATIVE = "native.js";

test("the minimal config keeps Biome's recommended rules and drops unused-parameter reports", () => {
  const out = lint([], NATIVE, ["minimal"], false);
  assert.match(out, /lint\/security\/noGlobalEval/);
  assert.doesNotMatch(out, /noUnusedFunctionParameters/);
  assert.doesNotMatch(out, /noImpliedEval|noVar/);
});

test("the recommended config adds the Oracle-backed native rules", () => {
  const out = lint([], NATIVE, ["recommended"], false);
  assert.match(out, /lint\/security\/noGlobalEval/);
  assert.match(out, /lint\/nursery\/noImpliedEval/);
  assert.doesNotMatch(out, /noVar/);
});

test("the all config adds the modernizing rules", () => {
  const out = lint([], NATIVE, ["all"], false);
  assert.match(out, /lint\/suspicious\/noVar/);
  assert.match(out, /lint\/nursery\/noImpliedEval/);
});

test("noMissingModules no longer asks for N/log", () => {
  assert.equal(count(lint(rule("noMissingModules"), "r-log.js")), 0);
});

test("Oracle runtime-failure rules fail the build and the low-confidence styles only warn", () => {
  const error = lint(rule("noSuiteQLTypeInSearch"), "r-server.js");
  assert.match(error, /×/);
  const warning = lint(rule("noWeakHash"), "r-server.js");
  assert.doesNotMatch(warning, /×.*MD5/);
});
