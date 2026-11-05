# Agents run probes through a sandbox runner

Verifying a claim about the platform used to need a person to paste a snippet into a browser console or the script debugger. We now let an agent run a version-controlled probe in a sandbox through one deployed script, the runner. The setup and commands are in `docs/verification/automation.md`.

## Decision

- A **probe** is a module in `verification/probes/`. It cites the contradictions or rules it verifies, and has a results page of the same name. `npm test` checks these links without NetSuite.
- The **runner** is a RESTlet in the sandbox. It runs a probe by name from a fixed list generated from the probes folder. It never runs code supplied in a request.
- The agent authenticates with OAuth 2.0 machine-to-machine (a certificate), through a dedicated least-privilege role. The SuiteCloud CLI is a pinned local dependency.
- The runner stays deployed. Each deploy needs the maintainer's approval. A probe that writes needs a separate one.
- Sandbox only, enforced twice: the tooling refuses a non-sandbox account, and the runner checks `runtime.envType`.

## Why

- **A RESTlet, not a Suitelet.** We found no Oracle page saying token authentication works for Suitelets. The alternative, a Suitelet "available without login" guarded by a secret in code, is an anonymous URL on an account that holds real data. Other script types can be reached later from the RESTlet (`N/https.requestSuitelet`, `N/task`), without exposing anything.
- **A fixed list, not evaluated code.** A RESTlet that evaluated code from its request would give remote code execution in the account to anyone who holds a token. With a fixed list the code that can run is the code in version control.
- **Persistent, not deploy-and-delete per run.** The SuiteCloud CLI has no command that deletes a script. The risk of leaving the runner is bounded: it runs only reviewed probes, only in a sandbox, only for one role, and has a documented off switch.
- **Version-controlled probes.** A verification that can be rerun on the next NetSuite release shows when the platform changed, which a pasted snippet in an issue comment never does.

## Consequences

- Setup is mostly manual (browser login, role, integration, certificate mapping) and a sandbox refresh clears it. The doctor tells the person what to do next; the agent does not create credentials.
- A RESTlet's runtime may differ from a Suitelet's, so a results page records the script type it ran under. Probes that depend on another script type are marked and fall back to prompting the user until their path exists.
- The runner is code in a sandbox that agents can call. Anyone changing it, or the probe-loading list, must keep the guardrails above.
