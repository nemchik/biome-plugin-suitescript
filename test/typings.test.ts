import assert from "node:assert/strict";
import { test } from "node:test";
import { extractTypings } from "../scripts/typings-extract.ts";
import { GAPS } from "../scripts/typings-gaps.ts";
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
