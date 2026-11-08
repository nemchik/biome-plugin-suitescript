import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const hook = fileURLToPath(
  new URL("../.claude/hooks/flow-reminders.ts", import.meta.url),
);

interface HookOutput {
  hookSpecificOutput: Record<string, unknown> & {
    additionalContext: string;
    hookEventName: string;
  };
}

/** Feeds the hook raw stdin and parses what it printed, if anything. */
function runRaw(input: string) {
  const result = spawnSync(process.execPath, [hook], {
    encoding: "utf8",
    input,
  });
  const output = result.stdout.trim()
    ? (JSON.parse(result.stdout) as HookOutput)
    : undefined;
  return { context: output?.hookSpecificOutput, output, result };
}

/** Runs the hook the way Claude Code does: the event as JSON on stdin. */
function run(prompt: string) {
  return runRaw(
    JSON.stringify({ hook_event_name: "UserPromptSubmit", prompt }),
  );
}

/** The injected reminder text for a prompt, or "" when nothing is injected. */
function reminderText(prompt: string): string {
  return run(prompt).context?.additionalContext ?? "";
}

const flow = [
  "grill-with-docs",
  "grill-me",
  "wayfinder",
  "to-spec",
  "to-tickets",
  "implement",
  "implement-spec",
  "code-review",
  "retro",
];

for (const name of flow) {
  test(`/${name} injects its reminder`, () => {
    const { context, result } = run(`/${name} 94`);
    assert.equal(result.status, 0);
    assert.equal(context?.hookEventName, "UserPromptSubmit");
    assert.ok(context?.additionalContext.includes(`/${name}`));
    assert.match(context.additionalContext, /not model-invocable/);
  });
}

test("the expanded command form is recognised", () => {
  const { context } = run(
    "<command-message>implement</command-message>\n<command-name>implement</command-name>",
  );
  assert.ok(context?.additionalContext.includes("/implement"));
});

test("the grill reminder checks that grilling and domain-modeling loaded", () => {
  const text = reminderText("/grill-with-docs");
  assert.match(text, /grilling/);
  assert.match(text, /domain-modeling/);
  assert.match(text, /"yes" or "lgtm" approves the summary only/);
});

test("every step states a prerequisite, a guard rail and a next step", () => {
  for (const name of flow) {
    const text = reminderText(`/${name}`);
    for (const label of ["Prerequisite", "Guard rail", "Next step"]) {
      assert.match(text, new RegExp(`- ${label}: \\S`), `${name}: ${label}`);
    }
  }
});

test("later steps state their prerequisite", () => {
  assert.match(reminderText("/to-tickets"), /A spec or a decided thread/);
  assert.match(reminderText("/implement"), /Tickets/);
  assert.match(reminderText("/code-review"), /committed diff/);
});

test("/grill-me does not claim the docs-only edit rule", () => {
  assert.doesNotMatch(reminderText("/grill-me"), /edits only GLOSSARY/);
  assert.match(reminderText("/grill-with-docs"), /edits only GLOSSARY/);
});

test("the guard-rail table in the workflow doc matches the hook", () => {
  const doc = readFileSync(`${root}docs/agents/workflow.md`, "utf8");
  const section = doc.split("## Per-step guard rails")[1] ?? "";
  const rows = (section.split("## Standing rules")[0] ?? "")
    .split("\n")
    .filter((line) => /^\| `\//.test(line))
    .map((line) => {
      const [, step = "", leavesAlone = "", endsWith = ""] = line
        .split("|")
        .map((cell) => cell.trim());
      return { endsWith, leavesAlone, step: step.replaceAll("`", "") };
    });
  const documented = rows.map((row) => row.step);
  assert.deepEqual(
    documented.sort(),
    [
      "/code-review",
      "/grill-with-docs",
      "/implement",
      "/implement-spec",
      "/retro",
      "/to-spec",
      "/to-tickets",
      "/wayfinder",
    ].sort(),
  );
  for (const row of rows) {
    const name = row.step.slice(1);
    const text = reminderText(`/${name}`);
    for (const command of row.endsWith.match(/\/[a-z][a-z-]*/g) ?? []) {
      assert.ok(text.includes(command), `${name}: next step names ${command}`);
    }
    for (const phrase of row.leavesAlone.match(
      /\([^)]*(?:converges|excepted)[^)]*\)/g,
    ) ?? []) {
      assert.ok(text.includes(phrase), `${name}: guard rail keeps ${phrase}`);
    }
    if (name === "wayfinder") {
      assert.match(text, /mis-typed/);
    }
  }
});

test("other prompts and non-flow commands inject nothing", () => {
  for (const prompt of ["hello", "/tdd", "please /implement it", ""]) {
    const { context, result } = run(prompt);
    assert.equal(result.status, 0);
    assert.equal(context, undefined, prompt);
  }
});

test("bad input never fails or blocks", () => {
  const { output, result } = runRaw("not json");
  assert.equal(result.status, 0);
  assert.equal(output, undefined);
});

test("the hook is registered for UserPromptSubmit only and never blocks", () => {
  const settings = JSON.parse(
    readFileSync(`${root}.claude/settings.json`, "utf8"),
  ) as { hooks: Record<string, unknown[]> };
  assert.deepEqual(Object.keys(settings.hooks), ["UserPromptSubmit"]);
  for (const name of flow) {
    const { output, result } = run(`/${name}`);
    assert.equal(result.status, 0, name);
    assert.ok(output, name);
    assert.deepEqual(Object.keys(output), ["hookSpecificOutput"], name);
    assert.deepEqual(
      Object.keys(output.hookSpecificOutput).sort(),
      ["additionalContext", "hookEventName"],
      name,
    );
  }
});
