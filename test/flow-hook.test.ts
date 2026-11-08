import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const hook = fileURLToPath(
  new URL("../.claude/hooks/flow-reminders.ts", import.meta.url),
);

/** Runs the hook the way Claude Code does: the event as JSON on stdin. */
function run(prompt: string) {
  const result = spawnSync(process.execPath, [hook], {
    encoding: "utf8",
    input: JSON.stringify({ hook_event_name: "UserPromptSubmit", prompt }),
  });
  const context = result.stdout.trim()
    ? (
        JSON.parse(result.stdout) as {
          hookSpecificOutput: {
            additionalContext: string;
            hookEventName: string;
          };
        }
      ).hookSpecificOutput
    : undefined;
  return { context, result };
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
  const text = run("/grill-with-docs").context?.additionalContext ?? "";
  assert.match(text, /grilling/);
  assert.match(text, /domain-modeling/);
  assert.match(text, /"yes" or "lgtm" approves the summary only/);
});

test("later steps state their prerequisite", () => {
  const text = (name: string) => run(`/${name}`).context?.additionalContext;
  assert.match(text("to-tickets") ?? "", /spec or .*thread/);
  assert.match(text("implement") ?? "", /Tickets/);
  assert.match(text("code-review") ?? "", /committed diff/);
});

test("other prompts and non-flow commands inject nothing", () => {
  for (const prompt of ["hello", "/tdd", "please /implement it", ""]) {
    const { context, result } = run(prompt);
    assert.equal(result.status, 0);
    assert.equal(context, undefined, prompt);
  }
});

test("bad input never fails or blocks", () => {
  const result = spawnSync(process.execPath, [hook], {
    encoding: "utf8",
    input: "not json",
  });
  assert.equal(result.status, 0);
  assert.equal(result.stdout.trim(), "");
});

test("the hook is registered for UserPromptSubmit only and never blocks", () => {
  const settings = JSON.parse(
    readFileSync(`${root}.claude/settings.json`, "utf8"),
  ) as { hooks: Record<string, unknown[]> };
  assert.deepEqual(Object.keys(settings.hooks), ["UserPromptSubmit"]);
  const source = readFileSync(hook, "utf8");
  assert.doesNotMatch(source, /"decision"|permissionDecision|process\.exit\(2/);
});
