# Automated verification

An agent can run a [probe](../../GLOSSARY.md) in a NetSuite **sandbox** without a human pasting a snippet into a browser. The tooling is the [`suitescript-verify`](https://github.com/nemchik/suitescript-verify) package, a pinned dev dependency ([ADR 0009](../adr/0009-the-verification-tooling-is-a-separate-package.md)); the decision and guardrails are in [ADR 0007](../adr/0007-agents-run-probes-through-a-sandbox-runner.md). This repository keeps its probes, results pages, contradictions and tags.

The package's README is the command reference and its [lessons](https://github.com/nemchik/suitescript-verify/blob/main/docs/verification/lessons.md) are the setup and pitfalls guide (every lesson that applies to any project): read both before writing probes. None of this runs in `npm test` or CI, except the link checks in `test/verification.test.ts`, and none of it is published in this repository's package.

## Commands

`npm run verify -- <command>` runs the package bin from the repository root.

| Command                                           | Does                                                                                                                     |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `npm run verify -- doctor`                        | Read-only checklist. For each failing step it prints what you must do next.                                              |
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

A probe is `verification/probes/<slug>.js`. Besides the package's tags (`@scriptType Restlet`, `@param`, `@writes`) it uses this repository's:

| Tag              | Meaning                                                                                                               |
| ---------------- | --------------------------------------------------------------------------------------------------------------------- |
| `@contradiction` | A contradiction id from [`contradictions.md`](contradictions.md). Repeat it for several.                              |
| `@rule`          | A rule name from `src/rules/`. Repeat it for several.                                                                 |
| `@tooling`       | For a probe that verifies the tooling itself (probe zero). A probe needs a `@contradiction`, a `@rule` or `@tooling`. |

`npm test` checks that every probe has a results page linking it, that cited ids and rules exist, that no `TODO(verify)` is left, and that probes contain no identifier. A probe that settles a contradiction should also commit `<slug>.expect.json`, so `run` reports drift (exit code 2) on a later NetSuite version.

## Probe zero

The package does not ship a chain-proving probe, so this repository keeps [`probe-zero`](../../verification/probes/probe-zero.js) (`@tooling`). After every deploy run `npm run verify -- run probe-zero`. It proves the token, the deployed runner and the JSON back, and reports the facts every results page records. If it fails, no other result means anything.

## Role and script ids

The package's runner is the script `customscript_suitescript_verify_runner`, limited to the role with the ID **`customrole_suitescript_verify`**. This repository used `customrole_biome_verification` and `customscript_biome_verification_runner` before ADR 0009: a sandbox that was set up then needs a role with the new ID (and a new deploy), or the runner's calls fail with `INSUFFICIENT_PERMISSION`. A sandbox refresh clears the mappings and, presumably, the deployed runner.

## Lessons specific to this repository

1. **Probes are linted by CI (`biome ci --error-on-warnings`).** A probe that deliberately does what a rule forbids (`instanceof Array` in [global-tostring](results/global-tostring.md)) needs a `// biome-ignore lint/...: <why>` comment, and a probe written from a script on Windows needs `npm run format` for its line endings. Run `npx biome ci --error-on-warnings` before committing, not just `npm test`.

2. **The statuses in `contradictions.md` are `unverified`, `verified` and `not testable`** and `npm test` rejects anything else. Put a caveat ("RESTlet only", "partly") in the decision text, and leave the tracking issue open if part of the claim is untested.

When you hit a problem that is not specific to this repository, add it to the package's lessons; add one that is, here, in the same pull request, and correct an entry that proves wrong. Never put an account number, id, token or real record id in it.

## Not automated yet

- Probes whose claim depends on another script type (Suitelet, Map/Reduce, Scheduled, User Event, Client): the package is RESTlet-only in version 1. Until then, prompt the user ([`README.md`](README.md)).
- Probes that write (`@writes`).

## Recorded role permissions

The first successful run used a role with these permissions (the minimum was not isolated; the list is what was added after failures):

- Log in using OAuth 2.0 Access Tokens
- REST Web Services
- User Access Tokens
- Documents and Files
- Allow JS / HTML Uploads
- SuiteScript

The role that SDF deploys use needs the deploy permissions (Documents and Files, Allow JS / HTML Uploads, SuiteScript). The role the runner is called as must be the one in the deployment's audience (`customrole_suitescript_verify`); another role fails with `INSUFFICIENT_PERMISSION`. Both roles were the same custom role in the first run.

To import a role with `object:import` the SDF role also needs **Bulk Manage Roles**; the setup does not.
