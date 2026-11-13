# Verification

Oracle's agent skills, the type definitions and Oracle's documentation disagree with each other and sometimes with the platform. A verification is a test run in a NetSuite account that shows what the platform actually does. Where a source's claim about platform behavior and the verified behavior differ, the verified behavior wins (see [Verified facts](../rule-priority.md#verified-facts) in `docs/rule-priority.md`; a verification never overrides a recommendation unless it proves the recommendation cannot work).

This folder holds the evidence:

- [`results/`](results/): one page per verification.
- [`contradictions.md`](contradictions.md): every known contradiction between sources, whether it is verified, and what was decided.

## When to verify

Verify, or mark the claim unverified, whenever you:

- add or change a rule that depends on what the platform accepts, rejects or returns;
- research how a module, method or script type behaves;
- find a skill, a type definition or a documentation page that contradicts itself or another source.

An unverified claim stays marked "unverified" in the rule's source comment and in the README until a results page settles it. A contradiction goes in `contradictions.md` with its status, and the rule cites its id (`C-001`).

## For agents

If you can run the test yourself, do. The NetSuite connector can not execute a script, but a **probe** can run in a sandbox through the verification runner: write `verification/probes/<slug>.js` and run `npm run verify -- doctor`, then `npm run verify -- run <slug> --draft` ([`automation.md`](automation.md), [ADR 0007](../adr/0007-agents-run-probes-through-a-sandbox-runner.md), [ADR 0009](../adr/0009-the-verification-tooling-is-a-separate-package.md), [#74](https://github.com/nemchik/biome-plugin-suitescript/issues/74)). Setup is mostly the user's (browser login, role, certificate), so when the doctor fails, relay its next step and wait.

Before you write a batch of probes read the package's [lessons](https://github.com/nemchik/suitescript-verify/blob/main/docs/verification/lessons.md) and "Lessons" in [`automation.md`](automation.md) (repo-specific ones): each probe change costs the user a deploy, and one bad probe can take the whole runner down. If you meet a problem that neither describes, record a repo-specific one in `automation.md` in the same pull request; for one that applies to any project, open a pull request in the [suitescript-verify](https://github.com/nemchik/suitescript-verify) repository and link it. Correct an entry that turns out to be wrong.

Prompt the user to run a snippet by hand (the methods below) only when a probe can not run: the doctor can not pass, the claim depends on a script type the runner does not cover (anything but a RESTlet), or the probe would write to the account. Give them the exact snippet and say where to run it. Never run anything in production. Do not guess the result, and do not mark a claim verified from a paraphrase of documentation: verified means a test ran.

## Methods

Record the method, the NetSuite version (for example `2026.2`; it is under Help > About), and whether the account is a sandbox or production.

**Do not put the account number in a verification**, nor an account URL, user, token or an internal id of a real record. They identify a company's account, they are not needed to reproduce a result, and they are a security risk in a public repository. Replace ids with placeholders.

### Client scripts: browser console

1. Log in and open any record page.
2. Open the browser developer tools console.
3. Load modules with `require` and print the results:

```js
require(["N/util"], function (u) {
    console.log(
        JSON.stringify({ isArray: u.isArray([]), nanoTime: typeof u.nanoTime }),
    );
});
```

This runs in the browser's JavaScript engine, not the server's, so it says nothing about server-only behavior (`typeof performance` differs between the two).

### Server scripts, quick: script debugger

Customization > Scripting > Script Debugger. Paste a script, run it and print results with `console.log` or the debugger's output. It runs on the server, but behaves differently from a deployed script in places (`util.nanoTime` throws in the debugger). Confirm a surprising result with a deployed script.

### Server scripts, authoritative: deployed Suitelet

Upload a script to the File Cabinet, create a Script record and a Deployment (status Testing, audience yourself) and open the deployment URL. A minimal template:

```js
/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define([], () => ({
    onRequest({ response }) {
        const r = {};
        const t = (k, f) => {
            try {
                r[k] = f();
            } catch (e) {
                r[k] = "THROWS: " + e.name + ": " + e.message;
            }
        };
        t("example", () => typeof util.isArray);
        response.write(JSON.stringify(r, null, 1));
    },
}));
```

Other script types (Map/Reduce, Scheduled, User Event, RESTlet) can behave differently from a Suitelet. Test the script type a rule targets.

## Documenting a verification

Copy this template to `results/<slug>.md` (lowercase, hyphens, for example `util-each.md`). Every section is required: a verification without its test, results and decision is not a verification.

```markdown
# <What was verified>

- **NetSuite version:** 2026.2
- **Account type:** sandbox
- **Date:** YYYY-MM-DD
- **Method:** browser console | script debugger | deployed <script type> | deployed RESTlet (the verification runner)
- **Script type:** RESTlet (only for a probe; also names it: **Probe:** [verification/probes/<slug>.js](../../../verification/probes/<slug>.js))
- **Contradictions settled:** C-0NN (or none)
- **Issue:** #NN (or none)

## Test

The script, verbatim, so anyone can run it again.

## Results

The raw output, including error messages.

## Explanation

What the results mean, and how they relate to what each source claims.

## Decision

What we decided because of the results, and which rules, comments or docs changed.
```

`npm run verify -- run <slug> --draft` writes this page for a probe, with the version, script, output and date filled in and scrubbed of identifiers. Replace each `TODO(verify)`: `npm test` fails while one is left.

Then update the contradiction's row in `contradictions.md` (status, results page, decision), and cite the results page in the rule's source comment as `docs/verification/results/<slug>.md`. `npm test` fails when a cited results page or contradiction id does not exist.
