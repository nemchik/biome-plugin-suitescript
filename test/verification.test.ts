import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const verification = join(root, "docs", "verification");
const results = join(verification, "results");
const read = (path: string) =>
  readFileSync(path, "utf8").replace(/\r\n/g, "\n");

const contradictions = read(join(verification, "contradictions.md"));
const rows = [...contradictions.matchAll(/^\| (C-\d{3}) \|(.*)\|$/gm)].map(
  (match) => ({ cells: (match[2] ?? "").split("|"), id: match[1] ?? "" }),
);
const ids = new Set(rows.map((row) => row.id));

/** Files whose text may cite a results page or a contradiction id. */
function citing(): string[] {
  const files = [join(root, "README.md"), join(root, "AGENTS.md")];
  const walk = (dir: string, extensions: string[]) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) walk(path, extensions);
      else if (extensions.some((ext) => entry.name.endsWith(ext)))
        files.push(path);
    }
  };
  walk(join(root, "docs"), [".md"]);
  walk(join(root, "src", "rules"), [".ts", ".grit"]);
  files.push(join(root, "scripts", "rule-sources.ts"));
  return files;
}

test("contradictions.md lists unique ids with a known status", () => {
  assert.ok(rows.length > 0, "no contradiction rows found");
  assert.equal(ids.size, rows.length, "a contradiction id is repeated");
  for (const { id, cells } of rows) {
    const status = (cells[2] ?? "").trim();
    assert.match(status, /^(unverified|verified|not testable)$/, id);
  }
});

test("a verified contradiction links its results page, an unverified one has an issue", () => {
  for (const { id, cells } of rows) {
    const status = (cells[2] ?? "").trim();
    const link = cells[3] ?? "";
    if (status === "verified") {
      assert.match(
        link,
        /results\/[a-z0-9-]+\.md/,
        `${id} is verified without a results page`,
      );
    }
    if (status === "unverified") {
      assert.match(
        link,
        /#\d+/,
        `${id} is unverified without a tracking issue`,
      );
    }
  }
});

test("every cited results page and contradiction id exists", () => {
  for (const file of citing()) {
    const text = read(file);
    const name = relative(root, file).replace(/\\/g, "/");
    for (const match of text.matchAll(/results\/([a-z0-9-]+)\.md/g)) {
      assert.ok(
        existsSync(join(results, `${match[1]}.md`)),
        `${name} cites docs/verification/results/${match[1]}.md, which does not exist`,
      );
    }
    for (const match of text.matchAll(/\bC-\d{3}\b/g)) {
      assert.ok(
        ids.has(match[0]),
        `${name} cites ${match[0]}, which is not in docs/verification/contradictions.md`,
      );
    }
  }
});

test("every results page has the required fields and sections", () => {
  const pages = readdirSync(results).filter((file) => file.endsWith(".md"));
  assert.ok(pages.length > 0);
  for (const page of pages) {
    const text = read(join(results, page));
    assert.match(
      text,
      /\*\*NetSuite version:\*\* \d{4}\.\d/,
      `${page}: NetSuite version`,
    );
    for (const field of ["Date", "Method", "Contradictions settled"]) {
      assert.ok(text.includes(`**${field}:**`), `${page}: ${field}`);
    }
    for (const heading of ["Test", "Results", "Explanation", "Decision"]) {
      assert.ok(text.includes(`\n## ${heading}\n`), `${page}: ## ${heading}`);
    }
  }
});

test("verification pages never include an account number or id", () => {
  const account =
    /\b\d{5,8}_(?:SB|RP|TSTDRV)\w*\b|\bTSTDRV\d+\b|\/app\/[a-z]+\/[a-z]+\.nl\?[^\s]*\bid=\d{3,}/i;
  const files = [
    join(verification, "README.md"),
    join(verification, "contradictions.md"),
    ...readdirSync(results).map((file) => join(results, file)),
  ];
  for (const file of files) {
    assert.doesNotMatch(
      read(file),
      account,
      `${relative(root, file)} looks like it includes an account number or record id (see docs/verification/README.md)`,
    );
  }
});
