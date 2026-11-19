# suitescript-verify 2 writes the runner's role and hosts Suitelet probes

This repository moves from `suitescript-verify` 0.2.0 to 2.0.0. Version 2 changes three things ADR 0007 and ADR 0009 assumed: the runner was RESTlet-only, its role was built by hand, and a probe of our own (`probe-zero`) proved the runner loaded. We checked 2.0 in our sandbox before its release (nemchik/suitescript-verify#46).

## Decision

- **Pin `suitescript-verify` 2.0.0.** The runner is now `customscript_suitescript_verify_rl` (renamed by script type), with a **Suitelet host** (`customscript_suitescript_verify_sl`) beside it. A probe may declare `@scriptType Suitelet`; the runner reaches the host with `N/https.requestSuitelet`. This settles ADR 0009's "Version 1 is RESTlet-only" and ADR 0007's "Other script types can be reached later from the RESTlet" for Suitelets.
- **Every deploy writes the runner's role.** It holds `ADMI_LOGIN_OAUTH2` and `ADMI_RESTWEBSERVICES` at Full plus each permission a probe declares with `@permission <permkey> VIEW`. A probe that needs a permission declares it; nobody adds one by hand, since no deploy removes it. This makes ADR 0007's "dedicated least-privilege role" hold by construction.
- **Use the package's default role, `customrole_suitescript_verify`.** `verification/.env` no longer sets `SUITESCRIPT_VERIFY_ROLE_ID`. The old hand-built `customrole_biome_verification` is not used by the runner any more, and its certificate mapping was replaced: a mapping cannot move to another role.
- **The SDF login deploys as Administrator**, never as the runner's role, because a deploy rewrites that role and needs Bulk Manage Roles.
- **`doctor`'s self-check replaces `probe-zero`.** It asks the deployed runner and the host for their version, build fingerprint, probe list and role permissions, so a separate probe that only proved the chain is deleted.

## Why

- The hand-built role held permissions no probe declared, so results depended on a role nobody could read from the repository. Declared permissions keep a probe's needs next to its code.
- Suitelet probes cover rules about Suitelet responses (headers, cookies, redirects) that a RESTlet cannot exercise.
- The self-check reports the deployed build, so an out-of-date runner is caught before any probe result is trusted.

## Consequences

- A probe that worked under the old role can fail under the new one with `INSUFFICIENT_PERMISSION`, or with a missing-table error (`Record 'scriptnote' was not found.`), until it declares the permission. Every probe was rerun after the upgrade.
- A Suitelet probe can be written for a Suitelet claim; the user is prompted for a snippet only for other script types or a write.
- The package's lessons now ship in its README, versioned with the pinned dependency; this repository points there instead of a page on the package's `main` branch.
- `customrole_biome_verification` and its old mappings stay in the sandbox until the maintainer removes them.
