# Workflow

The flow is grill, spec, tickets, implement, review, retro. `/ask-matt` is the full router and the authority on every branch; this page holds only what it does not: this repo's state-of-issue table and a guard rail per step. It carries no copy of the router.

A `UserPromptSubmit` hook (`.claude/hooks/flow-reminders.ts`, registered in `.claude/settings.json`) injects the matching guard rail, next-step line and prerequisite when a flow command is typed. It is reminder-only and never blocks a tool call.

## "Let's address issue N"

Read the issue, pick the step from what the tracker shows, tell the user which step that is, and **recommend the next slash command when the step ends**, naming the exact text to type. Do not start a step the user has not chosen, and do not do another step's work. Small, decided work goes to `/implement` in the same window; multi-session work goes to `/to-spec` or `/to-tickets`.

| State of issue N                                | Step to recommend                                                |
| ----------------------------------------------- | ---------------------------------------------------------------- |
| No decisions recorded, or open design questions | `/grill-with-docs` (or `/wayfinder` when it is too big)          |
| Decided, and small                              | `/implement`                                                     |
| Decided, multi-session, no spec                 | `/to-spec` (or `/to-tickets` straight from the thread)           |
| A spec exists, no tickets                       | `/to-tickets`                                                    |
| Tickets exist and an unblocked one is open      | `/implement` (one ticket) or `/implement-spec` (the whole graph) |
| An open PR closes it                            | `/code-review`, then merge                                       |
| Merged                                          | `/retro` if the session was rough                                |
| A wayfinder map with open frontier tickets      | `/wayfinder #<map>`                                              |
| A wayfinder map with no tickets left            | `/to-spec #<map>`                                                |

A later step entered early (for example `/implement` with no spec or tickets) first checks whether the earlier steps happened or whether the issue already holds enough to proceed, and says which. If not, it recommends the missing step before doing anything else.

## Which skills to recommend and which to load

- **User-invoked** (only the user can start them, so recommend the slash command and stop): `/grill-with-docs`, `/grill-me`, `/to-spec`, `/to-tickets`, `/implement`, `/implement-spec`, `/wayfinder`, `/retro`, `/triage`, `/handoff`, `/improve-codebase-architecture`, `/to-questionnaire`. The skills are installed but not model-invocable, so never claim one is missing.
- **Model-invoked** (load the skill and do the work): `grilling`, `tdd`, `code-review`, `pr`, `diagnosing-bugs`, `prototype`, `research`, `wizard`, `domain-modeling`, `codebase-design`, `writing-for-agents`.
- **Small and ad-hoc requests are exempt.** A question, a one-line fix or a small edit needs no skill and no recommendation. The rule applies when the request is the whole job of a user-invoked skill (a design interview, a spec, a ticket breakdown, a build from tickets or a spec, a retro).
- Before stating what a skill does, or recommending a step be skipped, read that skill's `SKILL.md`.

## Per-step guard rails

| Step               | Leaves alone                                                                                                                                                                                                                | Ends with                                                                                                                                                                                                                                                                                    |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/grill-with-docs` | Code, branches, commits, PRs, issues, deploys; edits only `GLOSSARY.md` and `docs/adr/`; confirms it loaded `grilling` and `domain-modeling` (the known failure is an interview with no recommendations and no paper trail) | The decisions summarised, "shared understanding reached?", then the route from `/ask-matt` (`/implement`, `/to-spec`, `/to-tickets`, `/wayfinder`, `/prototype`, `/to-questionnaire`). Then stop: "yes" or "lgtm" approves the summary only; building starts on "implement it" or "go ahead" |
| `/wayfinder`       | Product code; its own Notes as a carrier for execution; more than one ticket per session (research excepted); picking a prototype variant for the user                                                                      | Charting ends after creating tickets; a resolved ticket ends with the next frontier ticket; a clear map ends with `/to-spec #<map>`                                                                                                                                                          |
| `/to-spec`         | Interviewing and new decisions; the spec records only what was decided                                                                                                                                                      | `/to-tickets` in the same window                                                                                                                                                                                                                                                             |
| `/to-tickets`      | Code; publishing before the quiz is approved; closing the parent; the `ready-for-agent` label on a spec                                                                                                                     | `/implement` per ticket in a fresh window, or `/implement-spec`                                                                                                                                                                                                                              |
| `/implement`       | Reopening the plan; interviewing; building on the default branch                                                                                                                                                            | Commit first, then `/code-review` (fresh session), then close the ticket and tick its criteria (`/implement` does neither)                                                                                                                                                                   |
| `/code-review`     | Fixing; looping until clean; spawning more reviewers (known recursion bug)                                                                                                                                                  | Findings by axis; fixes are a new `/implement` pass; merge only after a review                                                                                                                                                                                                               |
| `/retro`           | Changing anything before the user picks a candidate                                                                                                                                                                         | The picked candidates as tickets or a grill                                                                                                                                                                                                                                                  |

## Standing rules

- `/code-review` runs before merge. Commit first: it diffs `HEAD`.
- `/implement` ends with a commit, then a review, then closing the ticket and ticking its criteria. `/implement` does neither the closing nor the ticking itself.
- Write files with the Write or Edit tool, never shell heredocs, and keep scripts in the scratchpad.
