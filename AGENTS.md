## Agent skills

### Issue tracker

Issues are tracked in GitHub Issues (`nemchik/biome-plugin-suitescript`) via the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

Default five-label vocabulary (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `GLOSSARY.md` and `docs/adr/` at the repo root. See `docs/agents/domain.md`.

### Workflow

When asked to address an issue or to run a flow step (`/implement`, `/code-review` and the rest), read `docs/agents/workflow.md`.

### Skills

Oracle's and Matt Pocock's skills are committed in `.agents/skills/` and managed with `npm run skills:*`. See `docs/agents/skills.md`; run `npm run skills:install` after cloning.

## GitHub Actions

Pin each action to its latest stable release (`gh api repos/<owner>/<repo>/releases/latest`); `test/actions.test.ts` enforces the SHA and the semver comment. Tool versions come from `package.json` `devEngines` (Node, npm), mirrored in `.nvmrc` and `.tool-versions`; change them in all three. The CI job that tests against the latest Biome is intentionally unpinned.

Accepting Oracle's SuiteCloud SDK license is the maintainer's act, never an agent's: do not set `SUITECLOUD_CLI_ACCEPT_LICENSE` in a shell or a file. The maintainer authorized the CI jobs that pass `suitecloud-sdk: "true"` to the setup action, and only the setup action sets the variable (ADR 0008); that does not extend to agents or to other jobs.

## Code

Source is TypeScript in `src/` and compiles to `dist/` (gitignored, published). Run `npm run format` before committing; CI runs `biome ci --error-on-warnings` and `tsc`. Never edit a generated file by hand: the manifest and presets come from `npm run build`, the module and typings data from `npm run sync-modules` and `npm run sync-typings`, and the README rules table, rule pages and migration table from `npm run readme` and `npm run docs` (data in `scripts/rule-sources.ts` and `test/cases.ts`). The file headers and the CI and tests name each generator, and fail on a hand edit.

## Rules

Start a new rule with `npm run new-rule -- <ruleName> --tier <1-5> [--grit]`; its `TODO(new-rule)` placeholders fail `npm test` until a human decides each one.

Before adding or changing a rule, follow `docs/rule-priority.md`: source tiers (Oracle agent skills, then type definitions, then Oracle docs, then SuiteScript-specific rules, then generic JavaScript; the lower tier wins a conflict, and a Tier 0 ADR in `docs/adr/` overrides all of them), and default severity and preset placement. Do not add a generic JavaScript rule unless it explicitly benefits SuiteScript and Biome does not already cover it. Assume SuiteScript 2.1 only, and never document backwards compatibility overrides for 1.0, 2.0 or 2.x. Read Oracle docs and skills in full, with every referenced material, never truncated; WebFetch summarises, so print a help-centre page with `npm run oracle-doc -- <section id or URL>`.

## Verification

Oracle's skills, the type definitions and Oracle's documentation contradict each other and sometimes the platform. A claim about what the platform does (what an API accepts or rejects, whether something fails, whether a member exists) needs a verification, or an "unverified" mark. Read `docs/verification/README.md` before adding or changing a rule, or researching how a module behaves. A verified behavior overrides a source's claim about the platform, but never a recommendation unless it proves the recommendation cannot work (`docs/rule-priority.md`, "Verified facts").

- If you can run the test yourself, do. Write a probe in `verification/probes/` and run it in the sandbox with `npm run verify -- doctor`, then `npm run verify -- run <slug> --draft` (the `suitescript-verify` package: `docs/verification/automation.md`, ADR 0007, ADR 0009). The doctor's failing steps are the user's to do: relay each and wait. Never run a real deploy or cleanup yourself: the commands refuse `--approved` without a terminal, so ask the user to run the same command in their own terminal, never accept the SuiteCloud license, create credentials or touch production for them. When a probe cannot run (the doctor cannot pass, a script type other than a RESTlet, or a write), prompt the user to run the snippet and paste the output, even when no skill is asking them questions. Do not guess the result, and do not call a claim verified from a paraphrase of documentation.
- When skills, type definitions or documentation contradict each other or themselves, add the contradiction to `docs/verification/contradictions.md`, cite its id in the rule's comment and mark the claim unverified until a test settles it.
- Document every verification as a page in `docs/verification/results/` (the test, the NetSuite version, the results, the explanation and the decision). Never put an account number, account URL, user, token or real record id in it; that is a security risk in a public repository.
- Read the package's lessons (`docs/verification/lessons.md` in `nemchik/suitescript-verify`) and "Lessons" in `docs/verification/automation.md` (repo-specific) before writing probes: batch them so the user deploys once, and run `probe-zero` after each deploy. When you hit a runner, deploy, probe or sandbox problem neither describes (what happened, what it cost, how to avoid it), record a repo-specific one in `automation.md` in the same pull request; for a generic one, open a pull request in the `suitescript-verify` repository and link it from yours. Correct any entry that proves wrong.

## Releases

Publishing uses npm trusted publishing (OIDC) from `.github/workflows/release.yml`; do not add an `NPM_TOKEN`. npm tokens that bypass 2FA lose publishing around January 2027.
