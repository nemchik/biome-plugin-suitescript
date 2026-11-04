import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { render } from "../scripts/migration-table.ts";

const guide = fileURLToPath(
  new URL("../docs/migrating-from-eslint.md", import.meta.url),
);

test("the migration guide's rule table is up to date (run npm run docs)", () => {
  const text = readFileSync(guide, "utf8").replace(/\r\n/g, "\n");
  assert.equal(text, render(text));
});

test("every ESLint rule the table lists exists in the guide's mapping", () => {
  const text = readFileSync(guide, "utf8");
  assert.match(text, /\| ESLint plugin \| ESLint rule \| Rule here \|/);
  assert.match(text, /eslint-plugin-amd \| `no-name` \| \[`noAmdName`\]/);
});
