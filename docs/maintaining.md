# Maintaining

Scheduled workflows keep generated data and vendored files current. Each opens a pull request when something changed; none merges itself. Review the diff before merging.

| Workflow           | Runs                                                   | Opens a PR when                                                                                                      | What to check                                                                                                                                                                                                 |
| ------------------ | ------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `sync-modules.yml` | Mondays                                                | `@hitc/netsuite-types` adds or changes N/ modules, options or enums (`npm run sync-modules`, `npm run sync-typings`) | New modules and options appear in `src/lib/modules.ts` and `src/lib/typings-data.ts`. If the typings gap test fails, a gap in `scripts/typings-gaps.ts` was fixed upstream and can be removed.                |
| `sync-readme.yml`  | Mondays (`release.yml` also runs it before publishing) | The README rules table is stale (`npm run readme`)                                                                   | The table matches `scripts/rule-sources.ts`.                                                                                                                                                                  |
| `sync-skills.yml`  | Mondays                                                | A skill source changed (`npm run skills:update`)                                                                     | Read the skill diff itself for injected instructions or new scripts. Changes under `netsuite-*` skills need a check of the rules that cite them against `docs/rule-priority.md`. See `docs/agents/skills.md`. |

Renovate keeps dependencies and action pins current and auto-merges safe updates (see `.github/renovate.json`). Releases come from release-please: merging its release PR publishes to npm through trusted publishing (`release.yml`, no token).

The code-owner rule in `.github/CODEOWNERS` makes review of `.agents/` and `skills-lock.json` mandatory.
