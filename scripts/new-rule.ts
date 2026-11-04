// Starts a new rule: `npm run new-rule -- noFoo --tier 3 [--grit]`.
// Creates the rule file, a fixture and a test case, and a `scripts/rule-sources.ts` entry, each marked
// `TODO(new-rule)`. The marker is a decision for a human (source, severity, preset), and
// `test/new-rule.test.ts` fails while any marker is left. docs/rule-priority.md has the defaults.
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { parseArgs } from "node:util";

export const MARKER = "TODO(new-rule)";

export interface Options {
  name: string;
  tier: number;
  grit?: boolean;
  /** Repository root; defaults to this repository. */
  root?: string;
}

export interface Result {
  created: string[];
  edited: string[];
}

const NAME = /^[a-z][a-z0-9]*(?:[A-Z][a-z0-9]*)+$/;

/** The severity and preset defaults from docs/rule-priority.md ("Severity and presets"), by tier. */
const DEFAULTS: Record<number, string> = {
  1: 'a convention is `warn`: in `recommended` when the source states it as a requirement ("must", "do not"), in `all` when it only recommends it',
  2: 'a convention is `warn`: in `recommended` when the source states it as a requirement ("must", "do not"), in `all` when it only recommends it',
  3: 'a convention is `warn`: in `recommended` when the source states it as a requirement ("must", "do not"), in `all` when it only recommends it',
  4: "a convention is `warn` and goes in `all`",
  5: "opt-in (in no preset) unless the violation would fail at runtime or on upload",
};

const COMMON =
  "a violation that fails at runtime or on upload is `error` and goes in `recommended`; a rule that guesses stays out of `recommended` (and out of every preset when a false positive would be costly). The preset lists are in scripts/build-manifest.ts; a rule in none of them is opt-in and needs an `optIn` reason in scripts/rule-sources.ts";

function guidance(tier: number): string[] {
  return [
    `${MARKER}: Tier ${tier}. Quote the source verbatim and say which file or page it came from (docs/rule-priority.md, "Recording the source").`,
    `${MARKER}: severity and preset. Tier ${tier} default: ${DEFAULTS[tier]}. Also, ${COMMON}.`,
  ];
}

function typescriptRule(name: string, tier: number): string {
  return `import { ast, defineRule, registerDiagnostic } from "@biomejs/runtime/plugin";

${guidance(tier)
  .map((line) => `// ${line}`)
  .join("\n")}
export const ${name} = defineRule({
  query: ast("JS_CALL_EXPRESSION"),
  run(node) {
    // ${MARKER}: decide what to report. This placeholder condition never matches.
    if (node.text === "${MARKER}") {
      registerDiagnostic(node, "warning", "${MARKER}: say what is wrong and what to do instead.");
    }
  },
});
`;
}

function gritRule(tier: number): string {
  return `engine biome(1.0)
language js(typescript, jsx)

${guidance(tier)
  .map((line) => `// ${line}`)
  .join("\n")}
\`TODO_new_rule_pattern($args)\` where {
  register_diagnostic(span=$args, message="${MARKER}: say what is wrong and what to do instead.", severity="warn")
}
`;
}

function fixture(name: string): string {
  return `// ${MARKER}: write the SuiteScript that ${name} should report (and, below it, code it must leave alone),
// then set the expected count for it in test/cases.ts.
`;
}

function source(name: string, tier: number): string {
  return `  ${name}: {
    description: "${MARKER}: describe the rule in one line",
    sources: [
      {
        label: "${MARKER}: name the source",
        tier: ${tier},
        url: "https://example.invalid/${MARKER}",
      },
    ],
  },
`;
}

const eolOf = (text: string) => (text.includes("\r\n") ? "\r\n" : "\n");

/** Inserts `block` into the first `{`/`[` list that follows `opening`, before the line `closing`. */
function insertBeforeClose(
  text: string,
  opening: string,
  closing: string,
  block: string,
  where?: (body: string) => number,
): string {
  const eol = eolOf(text);
  const start = text.indexOf(opening);
  if (start < 0) throw new Error(`Could not find \`${opening}\`.`);
  const closeAt = text.indexOf(`${eol}${closing}`, start);
  if (closeAt < 0) throw new Error(`Could not find the end of \`${opening}\`.`);
  const body = text.slice(start, closeAt + eol.length);
  const offset = where ? where(body) : body.length;
  const at = start + offset;
  return text.slice(0, at) + block.replace(/\n/g, eol) + text.slice(at);
}

export function scaffold(options: Options): Result {
  const { name, tier, grit = false } = options;
  const root = options.root ?? fileURLToPath(new URL("../", import.meta.url));
  if (!NAME.test(name)) {
    throw new Error(
      `"${name}" is not a camelCase rule name of two or more words (for example noRecordInLoop).`,
    );
  }
  if (!Number.isInteger(tier) || tier < 1 || tier > 5) {
    throw new Error(
      "--tier must be 1 to 5: 1 Oracle agent skills, 2 type definitions, 3 Oracle documentation, 4 SuiteScript-specific, 5 generic JavaScript (docs/rule-priority.md).",
    );
  }

  const rulePath = join("src", "rules", `${name}.${grit ? "grit" : "ts"}`);
  const fixturePath = join("test", "fixtures", `${name}.js`);
  const casesPath = join("test", "cases.ts");
  const sourcesPath = join("scripts", "rule-sources.ts");
  const at = (path: string) => join(root, path);

  for (const other of [`${name}.ts`, `${name}.grit`]) {
    if (existsSync(join(root, "src", "rules", other))) {
      throw new Error(`src/rules/${other} already exists.`);
    }
  }
  if (existsSync(at(fixturePath))) {
    throw new Error(`${fixturePath.replace(/\\/g, "/")} already exists.`);
  }
  const sources = readFileSync(at(sourcesPath), "utf8");
  if (new RegExp(`^  ${name}: \\{`, "m").test(sources)) {
    throw new Error(
      `${name} is already in ${sourcesPath.replace(/\\/g, "/")}.`,
    );
  }

  // Edit the shared files first: a missing anchor then leaves nothing half-written.
  const cases = readFileSync(at(casesPath), "utf8");
  const newCases = insertBeforeClose(
    cases,
    "export const CASES: [string, string, number][] = [",
    "];",
    `  // ${MARKER}: make ${fixturePath.replace(/\\/g, "/")} report ${name} and set the expected count.\n  ["${name}", "${name}.js", 1],\n`,
  );
  const newSources = insertBeforeClose(
    sources,
    "export const RULES: Record<string, RuleInfo> = {",
    "};",
    source(name, tier),
    (body) => {
      // Keep the entries alphabetical: insert before the first key that sorts after the new one.
      const key = /^ {2}(\w+): \{$/gm;
      for (let match = key.exec(body); match; match = key.exec(body)) {
        if ((match[1] ?? "") > name) return match.index;
      }
      return body.length;
    },
  );

  writeFileSync(
    at(rulePath),
    grit ? gritRule(tier) : typescriptRule(name, tier),
  );
  writeFileSync(at(fixturePath), fixture(name));
  writeFileSync(at(casesPath), newCases);
  writeFileSync(at(sourcesPath), newSources);

  return {
    created: [rulePath, fixturePath],
    edited: [casesPath, sourcesPath],
  };
}

function main(): void {
  const { positionals, values } = parseArgs({
    allowPositionals: true,
    options: { grit: { type: "boolean" }, tier: { type: "string" } },
  });
  const name = positionals[0];
  if (!name || positionals.length > 1 || values.tier === undefined) {
    console.error(
      "Usage: npm run new-rule -- <ruleName> --tier <1-5> [--grit]",
    );
    process.exit(2);
  }
  let result: Result;
  try {
    result = scaffold({
      grit: values.grit ?? false,
      name,
      tier: Number(values.tier),
    });
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(2);
  }
  const lines = [
    ...result.created.map((file) => `created ${file.replace(/\\/g, "/")}`),
    ...result.edited.map((file) => `edited  ${file.replace(/\\/g, "/")}`),
    "",
    `Every ${MARKER} is a decision for you, and npm test fails until none is left:`,
    "1. Confirm the tier, severity and preset against docs/rule-priority.md, and add the rule to the right list in scripts/build-manifest.ts (or give it an `optIn` reason in scripts/rule-sources.ts).",
    "2. Quote the source in the rule's comment, and fill in its entry in scripts/rule-sources.ts.",
    "3. Write the rule, make its fixture report it, and set the expected count in test/cases.ts.",
    "4. Run: npm run build, npm run docs, npm run readme, npm run format, npm test.",
  ];
  console.log(lines.join("\n"));
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main();
}
