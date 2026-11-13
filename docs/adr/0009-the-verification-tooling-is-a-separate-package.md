# The verification tooling is a separate package

The probe runner, its CLI and its guardrails (ADR 0007) are generic: the typings fork carries a copy of them, and any SuiteScript project has the same need. We will extract them into their own repository and npm package, `suitescript-verify`, and make this repository its first **downstream project**. This repository keeps what is specific to it: its probes and results pages, the contradictions, the `@rule` and `@contradiction` tags, and the `npm test` link checks.

## Decision

- **What moves:** the runner template, the CLI (`doctor`, `certificate`, `passkey`, `env`, `setup-ci`, `deploy`, `run`, `cleanup`, `init`), the `sdf/` template and the guardrails of ADR 0007 (sandbox only, approval typed at a terminal, identifier scrub, drift check against `*.expect.json`). The package knows about probes, a results page and an expected output, not about rules or contradictions; a downstream project can register extra tags to validate.
- **Configuration is environment variables with the `SUITESCRIPT_VERIFY_` prefix**, layered in this order, later winning: defaults (`verification/probes`, `docs/verification/results`, `verification/sdf`), a committed `verification/.env`, a gitignored `verification/.env.local`, then the process environment. The committed `.env` holds layout only. The env files live at `verification/`; `--dir <path>` on any command moves that root, and no setting points to it.
- **Every command, not only `doctor`, checks the committed `.env` against an allowlist of layout keys** and refuses to run on an unknown key, a path outside the project or a value that looks like a secret, naming the key and never printing the value. `init` and `doctor` report instead of refusing so a person can see what to fix. Every command also checks that `.env.local` is gitignored.
- **`@oracle/suitecloud-cli` is a peer dependency.** Each downstream project installs it and accepts Oracle's license itself. The package never sets `SUITECLOUD_CLI_ACCEPT_LICENSE`.
- **A probe may declare typed parameters** (for example `@param searchId string /^customsearch\w*$/`). The runner validates each against the declared pattern and passes it as data, never as code. A probe without `@param` takes none. This amends ADR 0007, whose request carried only the probe name, to cut the deploys that every new probe id used to cost.
- **Downstream probes and results stay in the downstream project**, in directories it configures. Probes that name its own scripts or searches never come to this repository or the package.
- **Version 1 is RESTlet-only.** Reaching a Suitelet (`N/https.requestSuitelet`) and reading its results back from the execution log are unverified; each is a probe in the package's first batch, and the Suitelet path ships only after a result is recorded.
- **The new repository starts with:** the Matt Pocock and NetSuite agent skills, the documentation here that is not about this project (the verification README and lessons, the workflow pages, the ADR format), Biome as linter and formatter (it does not use this plugin), lefthook with `git-pull-run`, and the GitHub Actions that make sense for a package (CI, code quality, release through trusted publishing). Nothing specific to this project is copied.

## Why

- Two repositories already carry the same runner, and they have started to diverge.
- A package lets a project keep its own probes and results, which can name its own scripts and so cannot be public here.
- Configuration in environment files means one format, one set of names and the same values in CI.
- The SuiteCloud license is the maintainer's act (AGENTS.md); a peer dependency keeps that act with each project instead of inheriting it through an install.

## Consequences

- This repository's `scripts/verify*` and `verification/runner`, `verification/sdf` are replaced by the package's bin once it is published. The package is developed in its own repository, `nemchik/suitescript-verify`, never as a workspace folder here.
- The package's own README must say in one line that it never accepts the license, and its `init` must leave a project with a to-do list, not credentials.
- Moving `docs/verification/automation.md` Lessons into the package means a lesson learned in one project reaches all of them; the package's instruction to record new lessons in the same pull request carries over.
- The unscoped name `suitescript-verify` was free on npm when checked; publish an early version to hold it.
