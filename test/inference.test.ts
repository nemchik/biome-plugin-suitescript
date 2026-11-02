import assert from "node:assert/strict";
import { test } from "node:test";
import {
  declaredProblems,
  inferredProblems,
  inferScriptType,
  typeByName,
} from "../src/lib/inference.ts";

test("generic names alone never imply a script", () => {
  assert.equal(
    inferScriptType(["get", "post", "map", "run", "render"]),
    undefined,
  );
});

test("a distinctive entry point implies its script type", () => {
  const inferred = inferScriptType(["beforeLoad", "afterSubmit"]);
  assert.deepEqual(
    inferred?.types.map((t) => t.name),
    ["UserEventScript"],
  );
});

test("mixed entry points have no single script type", () => {
  assert.equal(inferScriptType(["pageInit", "execute"])?.types.length, 0);
  assert.match(
    inferredProblems(["pageInit", "execute"])[0] ?? "",
    /do not belong/,
  );
});

test("map/reduce needs getInputData and map or reduce", () => {
  assert.deepEqual(inferredProblems(["getInputData", "map"]), []);
  assert.match(
    inferredProblems(["getInputData"])[0] ?? "",
    /requires entry point map or reduce/,
  );
  assert.deepEqual(inferredProblems(["map", "reduce"]), []);
});

test("a declared type is checked against what is returned", () => {
  assert.deepEqual(declaredProblems("Suitelet", ["onRequest"]), []);
  assert.match(
    declaredProblems("UserEventScript", ["execute"])[0] ?? "",
    /does not support/,
  );
  assert.match(
    declaredProblems("Suitelet", [])[0] ?? "",
    /Return at least one valid Suitelet/,
  );
});

test("script types are matched case-insensitively", () => {
  assert.equal(typeByName("suitelet")?.name, "Suitelet");
  assert.equal(typeByName("Nope"), undefined);
});
