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

/** The tags this repository registers with the suitescript-verify package. */
const ownTags = ["contradiction", "rule", "tooling"];

/** Reads the tags this repository owns from a probe's leading JSDoc block. */
function parseProbe(slug: string, source: string) {
  const block = /^\s*\/\*\*([\s\S]*?)\*\//.exec(source)?.[1] ?? "";
  const tags = (name: string) =>
    [...block.matchAll(new RegExp(`@${name}\\b[ \\t]*([^\\n*]*)`, "g"))].map(
      (match) => (match[1] ?? "").trim(),
    );
  return {
    contradictions: tags("contradiction").filter(Boolean),
    rules: tags("rule").filter(Boolean),
    scriptType: tags("scriptType")[0] ?? "",
    slug,
    tooling: tags("tooling").length > 0,
  };
}

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

// ---------------------------------------------------------------- probes

const probesDir = join(root, "verification", "probes");
const probeFiles = readdirSync(probesDir).filter((file) =>
  file.endsWith(".js"),
);
const slugOf = (file: string) => file.replace(/\.js$/, "");

test("every probe declares its script type and what it verifies", () => {
  assert.ok(probeFiles.length > 0, "no probes found");
  for (const file of probeFiles) {
    const probe = parseProbe(slugOf(file), read(join(probesDir, file)));
    assert.equal(
      probe.scriptType,
      "Restlet",
      `${file}: @scriptType must be Restlet (the runner's only supported type so far)`,
    );
    assert.ok(
      probe.contradictions.length + probe.rules.length > 0 || probe.tooling,
      `${file}: cite a @contradiction or a @rule it verifies, or mark it @tooling`,
    );
    for (const id of probe.contradictions) {
      assert.ok(
        ids.has(id),
        `${file} cites ${id}, which is not in contradictions.md`,
      );
    }
    for (const rule of probe.rules) {
      assert.ok(
        existsSync(join(root, "src", "rules", `${rule}.ts`)) ||
          existsSync(join(root, "src", "rules", `${rule}.grit`)),
        `${file} cites rule ${rule}, which does not exist in src/rules`,
      );
    }
  }
});

test("every probe has a results page that links back to it", () => {
  for (const file of probeFiles) {
    const slug = slugOf(file);
    const page = join(results, `${slug}.md`);
    assert.ok(
      existsSync(page),
      `${file} has no docs/verification/results/${slug}.md (run it: npm run verify -- run ${slug} --draft)`,
    );
    assert.ok(
      read(page).includes(`verification/probes/${slug}.js`),
      `${slug}.md does not link its probe verification/probes/${slug}.js`,
    );
  }
});

test("a results page that names a probe names one that exists", () => {
  for (const page of readdirSync(results).filter((f) => f.endsWith(".md"))) {
    const match = /\*\*Probe:\*\* \[([^\]]+)\]/.exec(read(join(results, page)));
    if (match) {
      assert.ok(
        existsSync(join(root, match[1] ?? "")),
        `${page} names probe ${match[1]}, which does not exist`,
      );
    }
  }
});

test("no results page still has a TODO(verify) placeholder", () => {
  for (const page of readdirSync(results).filter((f) => f.endsWith(".md"))) {
    assert.doesNotMatch(
      read(join(results, page)),
      /TODO\(verify\)/,
      `${page} still has a TODO(verify) placeholder`,
    );
  }
});

test("a probe's expected output is valid JSON for a probe that exists", () => {
  for (const file of readdirSync(probesDir).filter((f) =>
    f.endsWith(".expect.json"),
  )) {
    const slug = file.replace(/\.expect\.json$/, "");
    assert.ok(probeFiles.includes(`${slug}.js`), `${file} has no probe`);
    JSON.parse(read(join(probesDir, file)));
  }
});

test("probes contain no account number, token or key", () => {
  const identifier =
    /\b\d{5,8}_(?:SB|RP)\d*\b|-----BEGIN [A-Z ]*KEY-----|\beyJ[\w-]+\.[\w-]+\.[\w-]+\b/i;
  for (const file of probeFiles) {
    assert.doesNotMatch(
      read(join(probesDir, file)),
      identifier,
      `verification/probes/${file} looks like it contains an identifier`,
    );
  }
});

// ------------------------------------------------- the suitescript-verify package

test("the verification .env holds layout keys and registers this repository's tags", () => {
  const env = read(join(root, "verification", ".env"));
  const tags = /^SUITESCRIPT_VERIFY_EXTRA_TAGS=(.*)$/m.exec(env)?.[1] ?? "";
  assert.deepEqual(
    tags
      .split(",")
      .map((tag) => tag.trim())
      .sort(),
    ownTags,
  );
  for (const line of env.split(/\r?\n/).filter((l) => /^[A-Z]/.test(l))) {
    assert.match(
      line,
      /^SUITESCRIPT_VERIFY_(PROBES_DIR|RESULTS_DIR|SDF_DIR|EXTRA_TAGS)=/,
      "the committed .env holds layout keys only",
    );
  }
});

test("every probe tag is the package's or one registered here", () => {
  const known = new Set(
    [
      "NApiVersion",
      "NScriptType",
      "NModuleScope",
      "scriptType",
      "writes",
      "param",
      "see",
      "link",
      "example",
      "returns",
      "since",
      "deprecated",
      ...ownTags,
    ].map((tag) => tag.toLowerCase()),
  );
  for (const file of probeFiles) {
    const block =
      /^\s*\/\*\*([\s\S]*?)\*\//.exec(read(join(probesDir, file)))?.[1] ?? "";
    for (const match of block.matchAll(/^\s*\*\s*@(\w+)/gm)) {
      assert.ok(
        known.has((match[1] ?? "").toLowerCase()),
        `${file}: @${match[1]}`,
      );
    }
  }
});

test("the replaced local verification tooling is gone", () => {
  for (const path of [
    "scripts/verify.ts",
    "scripts/verify",
    "verification/runner",
    "verification/sdf",
    "test/verify.test.ts",
  ]) {
    assert.ok(!existsSync(join(root, path)), `${path} should be removed`);
  }
  const pkg = JSON.parse(read(join(root, "package.json")));
  assert.match(pkg.devDependencies["suitescript-verify"], /^\d+\.\d+\.\d+$/);
  assert.equal(pkg.scripts.verify, "suitescript-verify");
  assert.ok(
    !Object.keys(pkg.scripts).some((name) => name.startsWith("verify:")),
    "verify:* scripts point to the package bin now: npm run verify -- <command>",
  );
});

test("agent docs point to the package, not the removed scripts", () => {
  const files = [
    "AGENTS.md",
    "docs/verification/README.md",
    "docs/verification/automation.md",
    ".claude/settings.json",
  ];
  for (const file of files) {
    assert.doesNotMatch(
      read(join(root, file)),
      /verify:(doctor|run|deploy|cleanup|certificate|passkey|env|setup-ci)|scripts\/verify/,
      `${file} still names the removed local tooling`,
    );
  }
  assert.match(
    read(join(root, "docs/verification/automation.md")),
    /customrole_suitescript_verify/,
  );
});
