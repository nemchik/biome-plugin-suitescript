# Automated verification

An agent can run a [probe](../../GLOSSARY.md) in a NetSuite **sandbox** without a human pasting a snippet into a browser. The tooling is the [`suitescript-verify`](https://github.com/nemchik/suitescript-verify) package, a pinned dev dependency ([ADR 0009](../adr/0009-the-verification-tooling-is-a-separate-package.md)); the decision and guardrails are in [ADR 0007](../adr/0007-agents-run-probes-through-a-sandbox-runner.md), and the move to version 2 is [ADR 0010](../adr/0010-suitescript-verify-2-writes-the-runner-role-and-hosts-suitelet-probes.md). This repository keeps its probes, results pages, contradictions and tags.

The installed package's README (`node_modules/suitescript-verify/README.md`, the version this repository pins) is the command reference and the setup and pitfalls guide: its "For agents", Probes and Troubleshooting sections hold every lesson that applies to any project. Read it before writing probes. None of this runs in `npm test` or CI, except the link checks in `test/verification.test.ts`, and none of it is published in this repository's package.

## Commands

`npm run verify -- <command>` runs the package bin from the repository root.

| Command                                           | Does                                                                                                                     |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `npm run verify -- doctor`                        | Read-only checklist, ending with the deployed runner's self-check. For each failing step it prints what to do next.      |
| `npm run verify -- setup`                         | Guided setup, in the user's own terminal. It skips each step `doctor` already passes.                                    |
| `npm run verify -- certificate`                   | Generates the two key pairs and saves their paths to `verification/.env.local`.                                          |
| `npm run verify -- passkey`                       | Generates the CLI passkey and saves it to `verification/.env.local`.                                                     |
| `npm run verify -- env set NAME=value`            | Saves one value to `verification/.env.local`.                                                                            |
| `npm run verify -- setup-ci`                      | Registers the SDF credentials with the SuiteCloud CLI.                                                                   |
| `npm run verify -- deploy`                        | Generates the runner and **dry-runs** it. Add `--approved` to deploy: you run it in your own terminal and type `DEPLOY`. |
| `npm run verify -- run <slug> [--draft]`          | Runs one probe. `--draft` writes the results page if it does not exist yet.                                              |
| `npm run verify -- run <slug> --param name=value` | Passes a validated data parameter to a probe that declares `@param <name> <pattern>`.                                    |
| `npm run verify -- cleanup`                       | Dry-runs turning the runner off. Add `--approved` to do it and type `CLEANUP`.                                           |

## Configuration

The committed `verification/.env` holds layout keys only (probes in `verification/probes`, results in `docs/verification/results`, the generated SDF project in `verification/sdf`, which is gitignored) and registers this repository's own probe tags with `SUITESCRIPT_VERIFY_EXTRA_TAGS=contradiction,rule,tooling`. Credentials, ids, key paths and the passkey go in the gitignored `verification/.env.local`, never in a committed file. The accepting of Oracle's SuiteCloud license is the maintainer's (AGENTS.md, ADR 0008).

## Writing a probe

A probe is `verification/probes/<slug>.js`. Besides the package's tags (`@scriptType Restlet` or `@scriptType Suitelet`, `@param`, `@permission`, `@writes`) it uses this repository's:

| Tag              | Meaning                                                                                                  |
| ---------------- | -------------------------------------------------------------------------------------------------------- |
| `@contradiction` | A contradiction id from [`contradictions.md`](contradictions.md). Repeat it for several.                 |
| `@rule`          | A rule name from `src/rules/`. Repeat it for several.                                                    |
| `@tooling`       | For a probe that verifies the tooling itself. A probe needs a `@contradiction`, a `@rule` or `@tooling`. |

`npm test` checks that every probe has a results page linking it, that cited ids and rules exist, that no `TODO(verify)` is left, and that probes contain no identifier. A probe that settles a contradiction should also commit `<slug>.expect.json`, so `run` reports drift (exit code 2) on a later NetSuite version.

A probe that needs a record or setup permission declares it with `@permission <permkey> VIEW`; the next deploy adds it to the runner's role. Never ask for a permission to be added to the role by hand: no deploy removes it, and the probe would depend on a role nobody can read from the repository.

## After a deploy

Run `npm run verify -- doctor`. Its last step asks the deployed runner and the Suitelet host for their version, build fingerprint, probe list and role permissions, and says "Redeploy" when they differ from this checkout. If it fails, no probe result means anything. It replaced this repository's `probe-zero` (ADR 0010).

## Role and script ids

This repository uses the package defaults: the runner is the RESTlet `customscript_suitescript_verify_rl`, the Suitelet host beside it is `customscript_suitescript_verify_sl`, and the runner's role is `customrole_suitescript_verify`. Every deploy writes that role: Log in using OAuth 2.0 Access Tokens and REST Web Services at Full, plus what probes declare. The SDF login deploys as Administrator, which has the Bulk Manage Roles permission a role object needs; it must never be the runner's role, which a deploy rewrites. A certificate mapping cannot move to another role, so a role change needs a new key pair and a new mapping. A sandbox refresh clears the mappings and, presumably, the deployed runner.

## Lessons specific to this repository

1. **Probes are linted by CI (`biome ci --error-on-warnings`).** A probe that deliberately does what a rule forbids (`instanceof Array` in [global-tostring](results/global-tostring.md)) needs a `// biome-ignore lint/...: <why>` comment, and a probe written from a script on Windows needs `npm run format` for its line endings. Run `npx biome ci --error-on-warnings` before committing, not just `npm test`.

2. **The statuses in `contradictions.md` are `unverified`, `verified` and `not testable`** and `npm test` rejects anything else. Put a caveat ("RESTlet only", "partly") in the decision text, and leave the tracking issue open if part of the claim is untested.

3. **A probe with volatile output has no `expect.json`, and a new probe has none until its first run.** The drift check compares the whole output, so a count that changes on every run (as in [script-note-read](results/script-note-read.md)) cannot have one, and a probe written before it has run cannot guess one. Write the file from the first run's output, or say on the results page why there is none.

4. **`verification/.env.local` is gitignored, so a git worktree does not have it.** `doctor`, `deploy` and `run` fail there. Run them from the main checkout (merge the probes into the branch you run from first), and a probe added after a deploy needs a new real deploy before `run` can find it.

5. **The old hand-built role hid missing permissions.** Under the role every deploy now writes, a SuiteQL query on `scriptnote` answers `Record 'scriptnote' was not found.`, a missing permission worded as a missing table; [script-note-read](results/script-note-read.md) declares SuiteScript for it. After a role change, rerun every probe, not only the ones with an `expect.json`.

When you hit a problem that is not specific to this repository, open an issue or pull request in the [suitescript-verify](https://github.com/nemchik/suitescript-verify) repository so it ships in the package README; add one that is, here, in the same pull request, and correct an entry that proves wrong. Never put an account number, id, token or real record id in it.

## Not automated yet

- Probes whose claim depends on a script type other than a RESTlet or a Suitelet (Map/Reduce, Scheduled, User Event, Client). Prompt the user ([`README.md`](README.md)).
- Probes that write (`@writes`).
