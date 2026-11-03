import assert from "node:assert/strict";
import { test } from "node:test";
import { count, lint, rule } from "./helpers.ts";

// [rule, fixture, expected diagnostics]
const CASES: [string, string, number][] = [
  ["noPostMessageWildcard", "r-client.js", 1],
  ["noInnerHtml", "r-client.js", 4],
  ["noSensitiveBrowserStorage", "r-client.js", 2],
  ["noWildcardCors", "r-server.js", 1],
  ["noInsecureCookie", "r-server.js", 1],
  ["noLocationHeader", "r-server.js", 1],
  ["noBlockedResponseHeader", "r-server.js", 2],
  ["noStackInResponse", "r-server.js", 1],
  ["noWeakHash", "r-server.js", 1],
  ["noSuiteQLSelectStar", "r-server.js", 1],
  ["noSuiteQLSystemNoteJoin", "r-server.js", 1],
  ["requireOrderByForPagedSuiteQL", "r-server.js", 1],
  ["noSuiteQLTypeInSearch", "r-server.js", 1],
  ["noAuthorizationHeaderInInternalRequest", "r-server.js", 1],
  ["noBlockedHttpsHeader", "r-server.js", 1],
  ["requireServerWidgetOptions", "r-server.js", 1],
  ["noUnsupportedServerWidgetFieldType", "r-server.js", 2],
  ["requireQueryOptions", "r-server.js", 4],
  ["requireServerResponseOptions", "r-server.js", 2],
  ["noConflictingClientScriptProps", "r-server.js", 1],
  ["noHardcodedAuthPasswords", "r-server.js", 2],
  ["noSecretKeyGuidAndSecret", "r-server.js", 1],
  ["requireEachReturn", "r-server.js", 2],
  ["noPublicFileUpload", "r-server.js", 2],
  ["noSuiteScript1Api", "r-old-api.js", 5],
  ["requireOptions", "r-typings.js", 4],
  ["noUnknownOptions", "r-typings.js", 1],
  ["noPositionalOptions", "r-typings.js", 1],
  ["noInvalidEnumMember", "r-typings.js", 2],
  ["noUnknownModuleMember", "r-typings.js", 1],
  ["requireOptions", "r-typings-es.ts", 1],
  ["noUnknownModuleMember", "r-typings-es.ts", 1],
  ["noRecordInLoop", "r-loops.js", 3],
  ["noDynamicSuiteQL", "r-suiteql.js", 2],
  ["noNativeIterators", "r-generators.js", 1],
  ["requireCustpagePrefix", "r-form.js", 1],
  ["noMultipleDefine", "r-defines.js", 1],
  ["noRequireInsteadOfDefine", "require-only.js", 1],
  ["noInvalidDefine", "define-shapes.js", 5],
  ["noExtraDeps", "define-shapes.js", 1],
  ["noExtraParams", "define-shapes.js", 1],
  ["noDynamicRequire", "dynamic-require.js", 2],
  ["requireLogModule", "r-log.js", 1],
  ["noGlobalShadowing", "r-amd.js", 1],
];

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
