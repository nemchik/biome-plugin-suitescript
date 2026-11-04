import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, test } from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";
import { MARKER, scaffold } from "../scripts/new-rule.ts";

const root = fileURLToPath(new URL("../", import.meta.url));
const temporary: string[] = [];

/** A throwaway copy of the files the scaffold edits, so the repository is never touched. */
function sandbox(): string {
  const dir = mkdtempSync(join(tmpdir(), "bps-new-rule-"));
  temporary.push(dir);
  for (const file of ["scripts/rule-sources.ts", "test/cases.ts"]) {
    mkdirSync(join(dir, file, ".."), { recursive: true });
    cpSync(join(root, file), join(dir, file));
  }
  mkdirSync(join(dir, "src/rules"), { recursive: true });
  mkdirSync(join(dir, "test/fixtures"), { recursive: true });
  writeFileSync(join(dir, "src/rules/noExistingRule.ts"), "");
  return dir;
}

after(() => {
  for (const dir of temporary) rmSync(dir, { force: true, recursive: true });
});

test("a TypeScript rule gets a rule file, a fixture, a case and a sources entry, all marked", async () => {
  const dir = sandbox();
  const result = scaffold({ name: "noScaffoldSample", root: dir, tier: 3 });
  assert.deepEqual(
    result.created.map((f) => f.replace(/\\/g, "/")),
    ["src/rules/noScaffoldSample.ts", "test/fixtures/noScaffoldSample.js"],
  );

  const rule = readFileSync(join(dir, "src/rules/noScaffoldSample.ts"), "utf8");
  assert.match(rule, /export const noScaffoldSample = defineRule\(/);
  assert.match(rule, /Tier 3 default: a convention is `warn`/);
  assert.match(rule, /fails at runtime or on upload is `error`/);
  assert.ok(rule.includes(MARKER));
  assert.ok(
    readFileSync(
      join(dir, "test/fixtures/noScaffoldSample.js"),
      "utf8",
    ).includes(MARKER),
  );

  const sources = await import(
    `${pathToFileURL(join(dir, "scripts/rule-sources.ts")).href}?ts=${Date.now()}`
  );
  const names = Object.keys(sources.RULES);
  assert.ok(names.includes("noScaffoldSample"));
  assert.deepEqual(names, [...names].sort(), "entries stay alphabetical");
  assert.equal(sources.RULES.noScaffoldSample.sources[0].tier, 3);
  assert.ok(sources.RULES.noScaffoldSample.description.includes(MARKER));

  const cases = await import(
    `${pathToFileURL(join(dir, "test/cases.ts")).href}?ts=${Date.now()}`
  );
  assert.deepEqual(
    cases.CASES.find(([name]: string[]) => name === "noScaffoldSample"),
    ["noScaffoldSample", "noScaffoldSample.js", 1],
  );
});

test("--grit starts a GritQL rule and a tier 5 rule is told it is opt-in by default", () => {
  const dir = sandbox();
  const result = scaffold({
    grit: true,
    name: "noScaffoldGritSample",
    root: dir,
    tier: 5,
  });
  assert.equal(
    result.created[0]?.replace(/\\/g, "/"),
    "src/rules/noScaffoldGritSample.grit",
  );
  const rule = readFileSync(
    join(dir, "src/rules/noScaffoldGritSample.grit"),
    "utf8",
  );
  assert.match(
    rule,
    /^engine biome\(1\.0\)\r?\nlanguage js\(typescript, jsx\)/,
  );
  assert.match(rule, /Tier 5 default: opt-in \(in no preset\)/);
  assert.ok(rule.includes("register_diagnostic("));
  assert.ok(!existsSync(join(dir, "src/rules/noScaffoldGritSample.ts")));
});

test("it refuses a rule that already exists, as a file or in the sources, and changes nothing", () => {
  const dir = sandbox();
  const before = readFileSync(join(dir, "scripts/rule-sources.ts"), "utf8");
  assert.throws(
    () => scaffold({ name: "noExistingRule", root: dir, tier: 3 }),
    /already exists/,
  );
  assert.throws(
    () => scaffold({ name: "noWildcardCors", root: dir, tier: 1 }),
    /already in scripts\/rule-sources\.ts/,
  );
  assert.equal(
    readFileSync(join(dir, "scripts/rule-sources.ts"), "utf8"),
    before,
  );
  assert.deepEqual(readdirSync(join(dir, "test/fixtures")), []);
});

test("it refuses a bad tier or a name that is not camelCase of two words", () => {
  const dir = sandbox();
  for (const tier of [0, 6, 2.5, Number.NaN]) {
    assert.throws(
      () => scaffold({ name: "noScaffoldSample", root: dir, tier }),
      /--tier must be 1 to 5/,
    );
  }
  for (const name of ["foo", "no-foo-bar", "NoFooBar", "no_foo"]) {
    assert.throws(() => scaffold({ name, root: dir, tier: 3 }), /camelCase/);
  }
  assert.deepEqual(readdirSync(join(dir, "test/fixtures")), []);
});

test("the command line exits with 2 and a usage message, without writing anything", () => {
  const run = (...args: string[]) =>
    spawnSync(process.execPath, [join(root, "scripts/new-rule.ts"), ...args], {
      encoding: "utf8",
    });
  const noTier = run("noScaffoldSample");
  assert.equal(noTier.status, 2);
  assert.match(noTier.stderr, /Usage: npm run new-rule/);
  const badTier = run("noScaffoldSample", "--tier", "9");
  assert.equal(badTier.status, 2);
  assert.match(badTier.stderr, /--tier must be 1 to 5/);
  assert.ok(!existsSync(join(root, "src/rules/noScaffoldSample.ts")));
});

test("no scaffold placeholder is left in the repository (decide each TODO(new-rule))", () => {
  const left: string[] = [];
  const scan = (dir: string) => {
    for (const entry of readdirSync(join(root, dir), { withFileTypes: true })) {
      const path = `${dir}/${entry.name}`;
      if (entry.isDirectory()) scan(path);
      else if (readFileSync(join(root, path), "utf8").includes(MARKER))
        left.push(path);
    }
  };
  for (const dir of ["src/rules", "test/fixtures"]) scan(dir);
  for (const file of ["scripts/rule-sources.ts", "test/cases.ts"]) {
    if (readFileSync(join(root, file), "utf8").includes(MARKER))
      left.push(file);
  }
  assert.deepEqual(left, []);
});
