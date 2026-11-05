# Automated verification

An agent can run a [probe](../../GLOSSARY.md) in a NetSuite **sandbox** without a human pasting a snippet into a browser. The decision and its guardrails are in [ADR 0007](../adr/0007-agents-run-probes-through-a-sandbox-runner.md). This page is the setup guide and the command reference. It is for agents and for the person who works with them: an agent can not do most of the setup, so it walks you through it.

None of this runs in `npm test` or CI, and none of it is published in the package.

## How it works

1. A **probe** is a version-controlled module in `verification/probes/<slug>.js`. It exercises one platform behavior and returns the result as data. Its header says what it verifies and how it may run.
2. The **runner** is one RESTlet deployed to your sandbox. It runs a probe by name from a fixed list generated from `verification/probes/`. It never runs code from a request, and it refuses to run unless the account is a sandbox.
3. `npm run verify:run` gets an OAuth 2.0 machine-to-machine token, calls the runner, checks the output for identifiers, compares it with the probe's expected output, and writes a results page draft.

The runner is a RESTlet because token authentication works for RESTlets and REST web services, not for Suitelets (no Oracle page says it does). A probe's result says it ran as a RESTlet: a RESTlet runs as the role mapped to the token, and `N/ui` modules are not available in one, so a probe that depends on another script type is not automated yet (below).

## Writing a probe

```js
/**
 * Does `util.nanoTime` work in a deployed server script?
 *
 * @NApiVersion 2.1
 * @scriptType Restlet
 * @contradiction C-010
 */
define([], () => ({
    run() {
        return { example: typeof util.isArray };
    },
}));
```

| Tag              | Meaning                                                                                                                |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `@scriptType`    | Required. Only `Restlet` runs today.                                                                                   |
| `@contradiction` | A contradiction id from [`contradictions.md`](contradictions.md). Repeat it for several.                               |
| `@rule`          | A rule name from `src/rules/`. Repeat it for several.                                                                  |
| `@tooling`       | For a probe that verifies this tooling itself (probe zero). A probe needs a `@contradiction`, a `@rule` or `@tooling`. |
| `@writes`        | The probe changes the account. It needs your separate approval and is not automated yet.                               |

`run()` returns a plain object. Wrap each check so a failure is data, not a crash:

```js
const t = (key, fn) => {
    try {
        result[key] = fn();
    } catch (e) {
        result[key] = `THROWS: ${e.name}: ${e.message}`;
    }
};
```

A probe that settles a contradiction should also commit `verification/probes/<slug>.expect.json`: the `result` it produced when it was verified. `verify:run` then reports **DRIFT** (exit code 2) when a later NetSuite version behaves differently. The raw output stays on the results page as the record.

Every probe needs a results page, `docs/verification/results/<slug>.md`, that links the probe. `npm test` checks the links, the cited ids and rules, that no `TODO(verify)` is left, and that probes contain no identifier.

## Commands

All run from the repository root. Pass extra arguments after `--`.

| Command                                  | Does                                                                                                                                 |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `npm run verify:doctor`                  | Read-only checklist. For each failing step it prints what you must do next. Offline.                                                 |
| `npm run verify:certificate`             | Optional. Generates the two key pairs with `openssl` and saves their paths to `verification/.env.local`.                             |
| `npm run verify:passkey`                 | Generates the CLI passkey and saves it to `verification/.env.local`.                                                                 |
| `npm run verify:env -- set NAME=value`   | Saves one value (an account, client or certificate id) to `verification/.env.local`.                                                 |
| `npm run verify:setup-ci`                | Runs `account:setup:ci` for `verification/sdf` from `verification/.env.local`.                                                       |
| `npm run verify:deploy`                  | Builds the runner and **dry-runs** the deployment. Add `-- --approved` to deploy: you run it in your own terminal and type `DEPLOY`. |
| `npm run verify:run -- <slug> [--draft]` | Runs one probe. `--draft` writes the results page if it does not exist yet.                                                          |
| `npm run verify:cleanup`                 | Dry-runs turning the runner's deployment off. Add `-- --approved` to do it: you run it in your own terminal and type `CLEANUP`.      |

## Setup

The doctor checks these in order. Steps 3 to 5 happen in NetSuite and are yours; the agent can only tell you what to enter.

1. **Tools.** `npm ci` installs the SuiteCloud CLI as a pinned dev dependency (we use the local copy, not a global one). You need Node 24 and Oracle JDK 17 or 21.
2. **SDK jar.** The CLI's postinstall script is not run by `npm ci`, so the jar is not downloaded by default. Read [Oracle's license](https://www.oracle.com/downloads/licenses/oracle-free-license.html) and, if you accept it, run `node node_modules/@oracle/suitecloud-cli/postinstall.js` with `SUITECLOUD_CLI_ACCEPT_LICENSE=true` in the environment. The agent must not accept the license for you. The jar goes to `~/.suitecloud-sdk/cli/` and its SHA-256 is checked.
3. **Browser login, once.** With `SUITECLOUD_CI_PASSKEY` **unset**, run `node node_modules/@oracle/suitecloud-cli/src/suitecloud.js account:setup` from `verification/sdf`, log in to the sandbox and choose a role. Oracle: the first authentication must be browser-based so the SuiteCloud Development Integration record is installed in the account.
4. **Role and integration** (in the sandbox):
   - Create a custom role with the **ID** `customrole_biome_verification` (the runner's deployment is limited to it). Start it minimal: **Log in using OAuth 2.0 Access Tokens**, plus whatever a failing call shows is missing. Oracle's [SDF Developer sample role](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_4731154857.html) lists the permissions SDF development needs, but not which are required for deploying or for calling a RESTlet, so the final list is recorded here once the first run succeeds (see "Recorded role permissions" below). The standard Developer role is not used: it is broad, and we could not confirm it exists in every account.
   - Create an integration record with **Client Credentials (Machine to Machine) Grant** checked, and note its client id. Also check the token-based authentication flags (`tokenauthflag`, `tbaissuetokenflag`) and the **RESTlets** and **REST Web Services** scopes (`restlets`, `rest`). With the grant alone the token endpoint issues a token, but every call with it fails with `401 INVALID_LOGIN_ATTEMPT`, and the Login Audit Trail shows only pass or fail. Which of the four is strictly required is not isolated.
5. **Certificates and mappings.** `npm run verify:certificate` generates two key pairs (or Oracle's `openssl` commands below by hand): one for the runner's integration and one for the **SuiteCloud Development Integration** that SDF deploys use. Oracle allows one certificate per integration, role and entity combination, so the two can not share a pair, and they differ in type: the runner pair is **EC P-256** (this tooling signs that token with ES256), but the SDF pair must be **RSA-4096 with an RSA-PSS certificate**, because Oracle's SDK signs the SDF login with PS256 and only parses an RSA key (an EC key fails `account:setup:ci` with "There was an error with the private key used to authenticate"). The doctor checks both types. In the sandbox go to Setup > Integration > Manage Authentication > OAuth 2.0 Client Credentials (M2M) Setup and create two mappings for your user and the role: one for your integration (upload `runner-public.pem`) and one for the SuiteCloud Development Integration (upload `sdf-public.pem`). Note both **certificate ids**.
6. **Local configuration.** Every value lives in `verification/.env.local` (gitignored), never in the system or user environment: a user-wide `SUITECLOUD_CI_PASSKEY`, for one, stops browser login in your other SuiteCloud projects. The tooling hands the passkey to the CLI for its own commands only. Commands that generate or take a value save it for you, and when a name is already set they ask whether to overwrite or keep it (an agent without a terminal keeps it and says so; rerun with `--overwrite` after you decide):
   - `npm run verify:certificate` saves `SUITESCRIPT_VERIFY_PRIVATE_KEY_PATH` and `SUITESCRIPT_VERIFY_SDF_PRIVATE_KEY_PATH`,
   - `npm run verify:passkey` saves `SUITESCRIPT_VERIFY_PASSKEY` (32 to 100 letters and digits),
   - `npm run verify:env -- set NAME=value` saves the ones only you know: `SUITESCRIPT_VERIFY_ACCOUNT` (the sandbox account id, `<digits>_SB<n>`), `SUITESCRIPT_VERIFY_CLIENT_ID`, `SUITESCRIPT_VERIFY_CERTIFICATE_ID` (the runner mapping) and `SUITESCRIPT_VERIFY_SDF_CERTIFICATE_ID` (the SDF mapping).
7. `npm run verify:setup-ci`, then `npm run verify:doctor` until it passes.
8. `npm run verify:deploy`, review the dry run, then run it with `-- --approved` yourself, in your own terminal (in Claude Code, type `!` before the command), and type `DEPLOY`.
9. `npm run verify:run -- probe-zero --draft`. Probe zero proves the chain (token, deploy, call, JSON back). If it can not pass for a reason outside this repository (a missing permission you can not grant, an Oracle restriction), record why on [#74](https://github.com/nemchik/biome-plugin-suitescript/issues/74) and keep prompting the user to run snippets by hand ([`README.md`](README.md)).

A sandbox **refresh** clears the M2M mappings and, presumably, the deployed runner. The doctor can not detect it; if a call fails with an authentication or "not found" error after a refresh, redo steps 4 to 8.

### Generating the certificate

`npm run verify:certificate` runs Oracle's documented commands with a 365-day validity (the maximum is two years). `-- --only runner` or `-- --only sdf` regenerates one pair. The runner pair (ES256):

```sh
openssl req -new -x509 -newkey ec -pkeyopt ec_paramgen_curve:prime256v1 \
  -pkeyopt ec_param_enc:named_curve -nodes -days 365 \
  -subj "/CN=biome-plugin-suitescript-verification" \
  -out runner-public.pem -keyout runner-private.pem
```

The SDF pair (RSA-PSS, PS256):

```sh
openssl req -new -x509 -newkey rsa:4096 -sigopt rsa_padding_mode:pss -sha256 \
  -sigopt rsa_pss_saltlen:64 -nodes -days 365 \
  -subj "/CN=biome-plugin-suitescript-verification" \
  -out sdf-public.pem -keyout sdf-private.pem
```

Regenerating a pair after you uploaded its certificate makes that mapping unusable (a certificate can be mapped once and the private key is lost), so the command warns when a certificate id is already saved. It writes the pairs outside the repository (default `~/.suitescript-verification/`), restricts the private keys to your user, asks before replacing an existing pair (an uploaded certificate stops matching a replaced key), and prints the paths of the two public certificates. It looks for `openssl` on the PATH and in Git for Windows. The private key is not encrypted (Oracle's command uses `-nodes`). Certificates expire: Oracle emails administrators two months, one month and 14 days before, and an expired or revoked certificate needs a new mapping.

## Guardrails

- **Sandbox only.** The tooling refuses an account id that is not `<digits>_SB<n>`, and the runner refuses unless `runtime.envType` is a sandbox.
- **No arbitrary code.** The request carries a probe name, never code. The only code the runner can run is in `verification/probes/`, reviewed in version control.
- **Approval for every write.** `verify:deploy` and `verify:cleanup` only dry-run for an agent: a real run needs `--approved` and you at a terminal typing `DEPLOY` or `CLEANUP`, which an agent's shell can not do, so the code enforces your approval. A probe that writes (`@writes`) needs its own approval.
- **No anonymous URL.** Calls use a bearer token; there is no Suitelet "available without login".
- **Secrets stay out.** The private keys live outside the repository. The passkey and the ids live in the gitignored `verification/.env.local`, which the doctor checks is ignored. Values are never printed, and the tooling never creates NetSuite credentials itself (the integration, role and mappings are yours).
- **No identifiers in the repository.** The output is scrubbed of your account, client and certificate ids, and the tooling refuses to print or record output that still looks like an account number, host, token, key or email.
- **The runner persists.** The CLI can not delete a script, so the runner stays deployed. To turn it off: `npm run verify:cleanup -- --approved` (deactivates the deployment), and revoke the certificate mapping to remove access. Both are safe to repeat.

## Lessons: why a batch of probes took four deploys

The first batch of eight probes (#67 to #73 and #41) needed four deploys where one should have been enough. Each deploy is the user's, in their own terminal, so a wasted one costs a person's time. What caused them, and how to avoid it:

1. **Every probe change needs a deploy.** The runner's probe list is generated into its dependency list, so a new, renamed or edited probe only exists in the sandbox after `verify:deploy -- --approved`. Write and review **all** the probes of a batch first, dry-run once, and ask for one deploy. After editing a probe, you need another.
2. **A probe that fails at module scope takes the whole runner down.** The runner loads every probe as a dependency of its own `define()`. If one probe's top-level code fails in a way its own `try/catch` cannot capture, the runner never loads and **every** probe, `probe-zero` included, returns `HTTP 400` with a message like `com.netsuite.suitescript.scriptobject.ScriptNullObjectAdapter@...`. That message names no probe. Recover by moving the suspect probe out of `verification/probes/`, dry-running, and asking for a redeploy. Keep module-scope probes rare and tiny, put one governed call in each, and run them last, one at a time, so a failure points at one call (a combined module-scope probe cost two deploys to bisect; see [module-scope-runtime-calls](results/module-scope-runtime-calls.md) and [module-scope-search-call](results/module-scope-search-call.md)). A search at module scope throws a catchable `SSS_USAGE_LIMIT_EXCEEDED`; the call that stopped the runner was one of `record.create` and `record.load` and was not isolated.
3. **After every deploy, run `probe-zero` first.** If it fails, the runner is broken (see 2) and no other result means anything. Do not run the rest of the batch against a broken runner.
4. **The role the runner uses is minimal.** It lacked Transactions > Find Transaction and Lists > Customers, so a probe that searches transactions or creates a customer record gets `INSUFFICIENT_PERMISSION`. That error comes after type validation, which is often still evidence ([suiteql-type-in-search](results/suiteql-type-in-search.md)), but a probe that needs a record permission should say so in its header, and a probe should prefer objects that need no permission (`runtime`, `search.createColumn`).
5. **Check how an API is chained before relying on it.** `crypto.createHash(...).update(...)` returns nothing, so chaining `.digest()` threw `Cannot read property 'digest' of undefined` and cost a deploy to fix. Read the method page for the return type, and call methods separately when it does not return the object.
6. **Outbound calls rate-limit.** A public echo service (httpbin) answered four requests in a row and then failed the fifth with a body that had no `headers`. Keep a probe to four requests or fewer and put the status code in the failure, not just a `TypeError`.
7. **Drafts go stale.** `verify:run --draft` never overwrites an existing results page. After a probe changes, refresh the page's Test and Results sections from the probe and its `.expect.json` (or delete the draft and run `--draft` again). Do not leave an output from an earlier version of the probe on the page.
8. **The expectation is the result, not the whole output.** `verification/probes/<slug>.expect.json` holds the `result` object, sorted and indented. Commit it only once the probe's output is stable: a flaky probe reports DRIFT.
9. **An agent's tool can refuse the deploy command.** An auto-mode classifier blocked `npm run verify:deploy` (even the dry run) when it was chained in one shell line with other commands. Run the dry run alone, and say so to the user if it is still refused; the real deploy is theirs anyway.
10. **Write probes with the file tools, not a shell heredoc.** Backticks, `${}` and quotes in a probe broke a shell heredoc on Windows. Use the Write tool.
11. **The statuses in `contradictions.md` are `unverified`, `verified` and `not testable`** and `npm test` rejects anything else. Put a caveat ("RESTlet only", "partly") in the decision text, and leave the tracking issue open if part of the claim is untested.

12. **Probes are linted by CI (`biome ci --error-on-warnings`).** A probe that deliberately does what a rule forbids (`instanceof Array` in [global-tostring](results/global-tostring.md)) needs a `// biome-ignore lint/...: <why>` comment, and a probe written from a script on Windows needs `npm run format` for its line endings. Run `npx biome ci --error-on-warnings` before committing, not just `npm test`.

## Keeping this page current

An agent that hits a problem with the runner, a deploy, a probe or the sandbox that is not described here **adds it to the list above in the same pull request that found it**: what happened, what it cost, how to avoid it next time. Keep each entry short and concrete (the message, the cause, the fix). Fix an entry that turns out to be wrong instead of adding a second one that contradicts it. Never put an account number, id, token or real record id in it.

## Not automated yet

- Probes whose claim depends on another script type (Suitelet, Map/Reduce, Scheduled, User Event, Client): the runner is a RESTlet. Planned: a Suitelet reached with `N/https.requestSuitelet` from the runner, and Map/Reduce and Scheduled scripts started with `N/task` that write their result to a scratch folder. User Event and Client scripts can not run without a record save or a browser. Until then, prompt the user ([`README.md`](README.md)).
- Probes that write (`@writes`).

## Recorded role permissions

The first successful run used a role with these permissions (the minimum was not isolated; the list is what was added after failures):

- Log in using OAuth 2.0 Access Tokens
- REST Web Services
- User Access Tokens
- Documents and Files
- Allow JS / HTML Uploads
- SuiteScript

The role that SDF deploys use needs the deploy permissions (Documents and Files, Allow JS / HTML Uploads, SuiteScript). The role the runner is called as must be the one in the deployment's audience (`customrole_biome_verification`); another role fails with `INSUFFICIENT_PERMISSION`. Both roles were the same custom role in the first run.

To import a role with `object:import` the SDF role also needs **Bulk Manage Roles**; the setup does not.
