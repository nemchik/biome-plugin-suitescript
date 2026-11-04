import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { pages } from "../scripts/rule-docs.ts";

const dir = fileURLToPath(new URL("../docs/rules/", import.meta.url));

test("every plugin rule has a generated page and no page is left over (run npm run docs)", () => {
  const expected = pages();
  assert.deepEqual(readdirSync(dir).sort(), Object.keys(expected).sort());
});

test("the rule pages are up to date (run npm run docs)", () => {
  for (const [file, content] of Object.entries(pages())) {
    assert.equal(
      readFileSync(dir + file, "utf8").replace(/\r\n/g, "\n"),
      content,
      `${file} is stale`,
    );
  }
});

test("each rule page says it is generated", () => {
  for (const file of readdirSync(dir)) {
    assert.match(
      readFileSync(dir + file, "utf8"),
      /^<!--\s+This page is generated\. Do not edit it by hand/,
      file,
    );
  }
});
