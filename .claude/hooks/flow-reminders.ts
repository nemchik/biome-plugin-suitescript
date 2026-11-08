// UserPromptSubmit hook: when a flow slash command is typed, inject that step's
// guard rail, its next-step line and the prerequisite of the step. Reminder-only:
// it always exits 0 and never blocks. See docs/agents/workflow.md.

const NOT_INVOCABLE =
  "The flow skills are installed but not model-invocable (only the user can start them), so recommend the slash command; never claim a skill is missing.";

interface Step {
  guardRail: string;
  nextStep: string;
  prerequisite: string;
}

/** The build steps share one guard rail; they differ in what they build from and close out. */
function buildStep(unit: string, prerequisite: string): Step {
  return {
    guardRail:
      "Do not reopen the plan, interview, or build on the default branch.",
    nextStep: `Commit first, then recommend /code-review (a fresh session), then closing the ${unit} and ticking its criteria (the build step does neither itself).`,
    prerequisite,
  };
}

const GRILL_STEP: Step = {
  guardRail:
    "Leave alone code, branches, commits, PRs, issues and deploys. Confirm the `grilling` and `domain-modeling` skills were loaded (read their SKILL.md) and recommend an answer with each question; the known failure is an interview with no recommendations and no paper trail.",
  nextStep:
    'End with the decisions summarised, "shared understanding reached?", then the route from /ask-matt (/implement, /to-spec, /to-tickets, /wayfinder, /prototype, /to-questionnaire). Then stop: "yes" or "lgtm" approves the summary only; building starts on "implement it" or "go ahead".',
  prerequisite: "None: this is the first step.",
};

const STEPS: Record<string, Step> = {
  "code-review": {
    guardRail:
      "Do not fix, loop until clean (it never converges), or spawn more reviewers (known recursion bug).",
    nextStep:
      "Report findings by axis. Fixes are a new /implement pass; merge only after a review.",
    prerequisite:
      "A committed diff: it diffs HEAD, so if the work is uncommitted, say so and recommend committing first. A fresh session is better than the one that wrote the code.",
  },
  "grill-me": GRILL_STEP,
  "grill-with-docs": {
    ...GRILL_STEP,
    guardRail: `${GRILL_STEP.guardRail} /grill-with-docs edits only GLOSSARY.md and docs/adr/.`,
  },
  implement: buildStep(
    "ticket",
    "Tickets (or an issue that already holds enough to proceed). If the earlier steps did not happen, say so and recommend the missing step before doing anything else.",
  ),
  "implement-spec": buildStep(
    "tickets",
    "A spec with tickets. If either is missing, recommend /to-spec or /to-tickets first.",
  ),
  retro: {
    guardRail: "Change nothing before the user picks a candidate.",
    nextStep:
      "End with the picked candidates as tickets or a grill (/to-tickets or /grill-with-docs).",
    prerequisite: "None: run it after a merge, when the session was rough.",
  },
  "to-spec": {
    guardRail:
      "Do not interview or make new decisions; the spec records only what was decided.",
    nextStep: "End by recommending /to-tickets in the same window.",
    prerequisite:
      "Decisions already made (a grill summary or an issue thread). If open questions remain, recommend /grill-with-docs.",
  },
  "to-tickets": {
    guardRail:
      "Do not write code, publish before the quiz is approved, close the parent, or put ready-for-agent on a spec.",
    nextStep:
      "End by recommending /implement per ticket in a fresh window, or /implement-spec for the whole graph.",
    prerequisite:
      "A spec or a decided thread. If neither exists, recommend /to-spec or /grill-with-docs.",
  },
  wayfinder: {
    guardRail:
      "Do not write product code, edit your own Notes to carry execution, work more than one ticket per session (research excepted), pick a prototype variant for the user, or treat a `task` that looks like a build slice as mis-typed.",
    nextStep:
      "Charting ends after creating tickets; a resolved ticket ends with the next frontier ticket; a clear map ends by recommending /to-spec #<map>.",
    prerequisite:
      "A destination too big for one session. If it fits one, recommend /grill-with-docs.",
  },
};

/**
 * Claude Code delivers a typed slash command to this hook in the expanded
 * `<command-name>` form (seen in a live /implement run); the typed form is kept
 * for a plain `/name` prompt.
 */
function commandOf(prompt: string): string | undefined {
  const typed = /^\s*\/([a-z][a-z0-9-]*)(?:\s|$)/.exec(prompt);
  if (typed) {
    return typed[1];
  }
  return /<command-name>\/?([a-z][a-z0-9-]*)<\/command-name>/.exec(prompt)?.[1];
}

function reminderFor(prompt: string): string | undefined {
  const name = commandOf(prompt);
  const step = name === undefined ? undefined : STEPS[name];
  if (name === undefined || step === undefined) {
    return undefined;
  }
  return [
    `Flow reminder for /${name} (docs/agents/workflow.md):`,
    `- Guard rail: ${step.guardRail}`,
    `- Prerequisite: ${step.prerequisite}`,
    `- Next step: ${step.nextStep}`,
    `- ${NOT_INVOCABLE}`,
    "- Before stating what a skill does or recommending a step be skipped, read that skill's SKILL.md.",
  ].join("\n");
}

function main(): void {
  let input = "";
  process.stdin.setEncoding("utf8");
  process.stdin.on("data", (chunk) => {
    input += chunk;
  });
  process.stdin.on("end", () => {
    try {
      const { prompt } = JSON.parse(input) as { prompt?: unknown };
      const text = reminderFor(typeof prompt === "string" ? prompt : "");
      if (text !== undefined) {
        process.stdout.write(
          JSON.stringify({
            hookSpecificOutput: {
              additionalContext: text,
              hookEventName: "UserPromptSubmit",
            },
          }),
        );
      }
    } catch {
      // Reminder-only: bad input is ignored, never an error.
    }
  });
}

if (process.argv[1] === import.meta.filename) {
  main();
}
