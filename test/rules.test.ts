import assert from "node:assert/strict";
import { test } from "node:test";
import { ALL, count, lint } from "./helpers.ts";

const WITH_LOG_MODULE = [...ALL, "biome-plugin-suitescript/noLogModule"];

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

test("requireLogModule asks for N/log while noMissingModules leaves the global alone", () => {
  const out = lint(
    ["biome-plugin-suitescript/requireLogModule"],
    "missing-log.js",
  );
  assert.match(out, /'log' is used but N\/log is not loaded/);
  assert.equal(
    count(
      lint(["biome-plugin-suitescript/noMissingModules"], "missing-log.js"),
    ),
    0,
  );
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

test("noHardcodedSecrets is opt-in and flags only secret-like literals", () => {
  const out = lint(
    ["biome-plugin-suitescript/noHardcodedSecrets"],
    "secrets.js",
  );
  assert.equal((out.match(/Do not hard-code/g) ?? []).length, 3);
  for (const name of ["password", "apiKey", "clientSecret"])
    assert.match(out, new RegExp(`Do not hard-code '${name}'`));
  assert.equal(count(lint(ALL, "secrets.js")), 0, "no preset enables it");
});

test("rules from the script type and module pages report what they should", () => {
  const out = lint(ALL, "pages-bad.js");
  assert.equal((out.match(/must start with 'custpage'/g) ?? []).length, 1);
  assert.match(out, /N\/https does not allow http:\/\/ URLs/);
  assert.equal((out.match(/Header names must not contain/g) ?? []).length, 1);
  assert.equal(
    (out.match(/cannot set both fieldId and formula/g) ?? []).length,
    1,
  );
  const client = lint(ALL, "client-validate.js");
  assert.match(client, /'saveRecord' must return true or false/);
  assert.doesNotMatch(client, /'validateField' must return/);
  assert.match(client, /log\.debug\(\) is ignored in client scripts/);
  assert.match(
    lint(ALL, "bundle.js"),
    /Custom modules are not supported in bundle installation scripts/,
  );
});

test("script type is inferred and required entry points are checked", () => {
  assert.equal(count(lint(ALL, "mr-valid.js")), 0);
  assert.match(
    lint(ALL, "mr-missing.js"),
    /MapReduceScript requires entry point map or reduce/,
  );
  assert.match(
    lint(ALL, "mr-mixed.js"),
    /map, onRequest do not belong to a single script type/,
  );
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
