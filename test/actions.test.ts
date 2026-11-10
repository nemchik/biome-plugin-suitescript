import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { basename, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const github = fileURLToPath(new URL("../.github/", import.meta.url));

/** Every workflow and composite action file under .github/. */
function actionFiles(): string[] {
  const files: string[] = [];
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) walk(path);
      else if (/\.ya?ml$/.test(entry.name) && /workflows|actions/.test(path))
        files.push(path);
    }
  };
  walk(github);
  return files;
}

/** The `uses:` references that are not local (`./...`). */
export function externalUses(text: string): string[] {
  return [...text.matchAll(/^\s*(?:-\s*)?uses:\s*(\S.*)$/gm)]
    .map((match) => (match[1] ?? "").trim())
    .filter((value) => !value.startsWith("./"));
}

test("every external action is pinned to a commit SHA with its semver in a trailing comment", () => {
  const unpinned: string[] = [];
  for (const file of actionFiles()) {
    for (const use of externalUses(readFileSync(file, "utf8"))) {
      if (!/^[\w.-]+\/[\w./-]+@[0-9a-f]{40} # v\d+\.\d+\.\d+$/.test(use)) {
        unpinned.push(`${file}: ${use}`);
      }
    }
  }
  assert.deepEqual(unpinned, []);
});

test("the pin check rejects a tag reference and a missing version comment", () => {
  assert.deepEqual(externalUses("- uses: actions/checkout@v4"), [
    "actions/checkout@v4",
  ]);
  assert.deepEqual(externalUses("- uses: ./.github/actions/setup"), []);
});

test("only ci and code-quality accept the SuiteCloud SDK license (ADR 0008)", () => {
  const accepting = actionFiles()
    .filter((file) =>
      /suitecloud-sdk:\s*"true"/.test(readFileSync(file, "utf8")),
    )
    .map((file) => basename(file))
    .sort();
  assert.deepEqual(accepting, ["ci.yml", "code-quality.yml"]);
});
