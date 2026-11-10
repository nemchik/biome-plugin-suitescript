# CI accepts the SuiteCloud SDK license in low-risk jobs

`@oracle/suitecloud-cli` has a postinstall script that downloads its SDK jar under Oracle's FUTC license. We allow it in `package.json` (`allowScripts`). On a machine with a desktop the script opens the license file as a notice and carries on; on a headless runner it exits 3 unless `SUITECLOUD_CLI_ACCEPT_LICENSE=true`, which broke every CI install.

## Decision

- The maintainer accepts the license for CI jobs that run the setup action with `suitecloud-sdk: "true"`: `ci` and `code-quality`. The setup action sets the variable for the install step only, never at workflow or repository level.
- Every other job (`release` and the `sync-*` workflows, which hold publishing or pull-request credentials) leaves the input at its default `"false"`. The action then installs with `--ignore-scripts`, so these jobs make no Oracle download and never see the license.
- Local installs are unchanged: the variable stays unset and the postinstall opens the license text, which is the intended notice to the person installing.
- Agents still never accept the license (`AGENTS.md`). This decision covers the CI jobs above and nothing else.

## Why

- A broken install, local or in CI, costs more than a download nobody uses. The jar is SHA-256 checked by the CLI.
- Release and sync jobs are where a compromised download would do the most harm, and they gain nothing from the jar, so they opt out.
- Default off means a new workflow accepts the license only when its author asks.

## Consequences

- The jar is downloaded on each `ci` and `code-quality` run (no cache, to avoid a cache-poisoning surface for a jar nothing in CI uses). Revisit if downloads prove slow or flaky.
- `--ignore-scripts` also skips lefthook's postinstall in those jobs, which they do not need.
