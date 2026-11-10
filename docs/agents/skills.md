# Agent skills

The agent skills this repo relies on are committed in `.agents/skills/`, so every contributor and every agent uses the same copy, version controlled with the code. Two sources are installed, in full:

- [`oracle/netsuite-suitecloud-sdk`](https://github.com/oracle/netsuite-suitecloud-sdk/tree/master/packages/agent-skills): Oracle's NetSuite agent skills, the first source tier in `docs/rule-priority.md`.
- [`mattpocock/skills`](https://github.com/mattpocock/skills): the workflow skills (triage, grilling, TDD, domain modeling, code review) that `AGENTS.md` and `docs/agents/*` assume.

## Tooling

Skills are managed with [`skills`](https://github.com/vercel-labs/skills), pinned in `devDependencies`. It installs to the universal `.agents/skills/` location that most agents read, and records each skill's source and content hash in `skills-lock.json`. Neither Oracle's skills nor Matt Pocock's are published to npm, so the lock file, not `package-lock.json`, pins them.

Claude Code reads `.claude/skills/` instead. `.claude/skills/` is gitignored and holds links to `.agents/skills/`, created by `npm run skills:install`. Committed symlinks would not survive a Windows checkout.

## Commands

| Command                              | Does                                                                                                          |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------- |
| `npm run skills:install`             | Restores `.agents/skills/` from `skills-lock.json` and links it into `.claude/skills/`. Run it after cloning. |
| `npm run skills:list`                | Lists installed skills and their sources.                                                                     |
| `npm run skills:check`               | Exits 1 when any installed skill has an update.                                                               |
| `npm run skills:update`              | Updates every skill to its source's latest, rewrites the lock and relinks.                                    |
| `npm run skills:add -- <owner/repo>` | Installs every skill from a new source (universal, plus the Claude Code links).                               |
| `npm run skills -- <args>`           | Runs any other `skills` command (`remove`, `find`, `--help`) without `npx`.                                   |

`skills:install` leaves skills that are already present as they are and fails in CI when a skill's content does not match the lock.

## Updates

`.github/workflows/sync-skills.yml` runs `npm run skills:update` every Monday and opens a pull request when anything changed. A change under a `netsuite-*` skill needs a review of the rules that cite it against `docs/rule-priority.md` before merging. Do not edit files in `.agents/skills/` by hand: the next update overwrites them, and the lock hash stops matching.

The workflow sets `AI_AGENT=claude` on the update step. A CI runner has no agent, and without it `skills update` targets every supported agent, including Eve, and writes a second copy of every skill to `agent/skills/` (pull request #107). A following step fails the job when anything outside `.agents/skills/` and `skills-lock.json` changed. Run the update locally only inside Claude Code or another detected agent, for the same reason.
