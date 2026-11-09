import assert from "node:assert/strict";
import { test } from "node:test";
import { extractTypings } from "../scripts/typings-extract.ts";
import { EXPORT_GAPS, GAPS } from "../scripts/typings-gaps.ts";
import { TYPINGS } from "../src/lib/typings-data.ts";

test("the generated typings data matches the installed type definitions (run npm run sync-typings)", () => {
  assert.deepEqual(JSON.parse(JSON.stringify(TYPINGS)), extractTypings());
});

test("the generated data describes the functions the rules depend on", () => {
  assert.deepEqual(TYPINGS["N/record"]?.functions.load, [
    [
      ["id", "type"],
      ["defaultValues", "id", "isDynamic", "type"],
    ],
  ]);
  assert.ok(TYPINGS["N/https"]?.functions.get, "re-exported http functions");
  assert.ok(TYPINGS["N/record"]?.enums.Type?.includes("CUSTOMER"));
  assert.equal(
    TYPINGS["N/file"]?.functions.load,
    0,
    "a function that also takes a plain id has no options shape",
  );
});

test("each known typings gap is still a gap (remove it from scripts/typings-gaps.ts once fixed)", () => {
  const raw = extractTypings(false);
  for (const gap of GAPS) {
    const alternatives = raw[gap.module]?.functions[gap.fn];
    assert.ok(Array.isArray(alternatives), `${gap.module} ${gap.fn} exists`);
    for (const option of gap.options) {
      assert.ok(
        !(alternatives as [string[], string[]][]).some(([, known]) =>
          known.includes(option),
        ),
        `${gap.fn} now lists ${option}; remove the gap`,
      );
    }
  }
});

test("each known member gap is still a gap (remove it from scripts/typings-gaps.ts once fixed)", () => {
  const raw = extractTypings(false);
  for (const gap of EXPORT_GAPS) {
    const exports = raw[gap.module]?.exports;
    assert.ok(Array.isArray(exports), `${gap.module} lists its exports`);
    assert.ok(
      !exports.includes(gap.name),
      `${gap.module} now exports ${gap.name}; remove the gap`,
    );
  }
});

test("a member gap adds the member to the module's exports", () => {
  assert.ok(
    extractTypings(true)["N/util"]?.exports?.includes("isAsyncFunction"),
  );
  assert.ok(
    !extractTypings(false)["N/util"]?.exports?.includes("isAsyncFunction"),
  );
});

test("a member gap on a module without an export list is an error", () => {
  const gap = { module: "N/noSuchModule", name: "nope", source: "test" };
  EXPORT_GAPS.push(gap);
  try {
    assert.throws(
      () => extractTypings(true),
      /N\/noSuchModule has no export list/,
    );
  } finally {
    EXPORT_GAPS.splice(EXPORT_GAPS.indexOf(gap), 1);
  }
});

test("every overload of a function contributes its options", () => {
  const create = TYPINGS["N/task"]?.functions.create;
  assert.ok(Array.isArray(create));
  const known = new Set(create.flatMap(([, names]) => names));
  for (const option of ["scriptId", "deploymentId", "params", "taskType"]) {
    assert.ok(known.has(option), option);
  }
  const parse = TYPINGS["N/format"]?.functions.parse;
  assert.ok(Array.isArray(parse));
  assert.ok(parse.some(([, names]) => names.includes("timezone")));
});
