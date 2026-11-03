import assert from "node:assert/strict";
import { test } from "node:test";
import { extractTypings } from "../scripts/typings-extract.ts";
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
