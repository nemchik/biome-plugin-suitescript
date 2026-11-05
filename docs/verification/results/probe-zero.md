# Verification runner: probe zero

- **NetSuite version:** 2026.2
- **Account type:** sandbox
- **Date:** 2026-11-05
- **Method:** deployed RESTlet (the verification runner), called with an OAuth 2.0 machine-to-machine token
- **Script type:** RESTlet
- **Probe:** [verification/probes/probe-zero.js](../../../verification/probes/probe-zero.js)
- **Contradictions settled:** none
- **Issue:** [#74](https://github.com/nemchik/biome-plugin-suitescript/issues/74)

## Test

```js
/**
 * Probe zero: proves the whole verification chain works (token, deploy, call,
 * JSON back) and reports the facts every results page records.
 *
 * @NApiVersion 2.1
 * @scriptType Restlet
 * @tooling
 */
define([], () => ({
    run() {
        const result = {};
        const t = (key, fn) => {
            try {
                result[key] = fn();
            } catch (e) {
                result[key] = `THROWS: ${e.name}: ${e.message}`;
            }
        };
        t("util is a global", () => typeof util);
        t("util.isArray([])", () => util.isArray([]));
        t("log is a global", () => typeof log);
        t("typeof performance", () => typeof performance);
        t("typeof process", () => typeof process);
        return result;
    },
}));
```

## Results

```json
{
    "util is a global": "object",
    "util.isArray([])": true,
    "log is a global": "object",
    "typeof performance": "undefined",
    "typeof process": "undefined"
}
```

The runner reported `scriptType: "RESTlet"` and `version: "2026.2"`.

## Explanation

The chain works end to end: the SuiteCloud CLI deployed the runner (dry run, then an approved deploy), the machine-to-machine token was issued, the RESTlet ran the named probe in a sandbox, and the JSON came back and passed the identifier scrub.

In a deployed RESTlet, `util` and `log` are globals, and neither `performance` nor `process` exists, the same as in the script debugger.

Getting a call through took more than the Oracle pages list. Each of these was found by a failure, and the first was the least obvious:

- **The token is issued before the identity is checked.** With the integration record's Client Credentials grant alone, the token endpoint returned a valid token, but every call with it (a RESTlet and the REST record API alike) failed with `401 INVALID_LOGIN_ATTEMPT`, and the Login Audit Trail showed only pass or fail. The call worked once the integration record also had the token-based authentication flags (`tokenauthflag`, `tbaissuetokenflag`) and the `restlets` and `rest` scopes. Which of the four is strictly required is not yet isolated.
- **The SDF login needs RSA.** Oracle's SDK signs the SDF login with PS256 and only reads an RSA private key, so an EC key fails `account:setup:ci`.
- **A role needs the deploy permissions too.** The SDF role needed Documents and Files, Allow JS / HTML Uploads and SuiteScript, and the runner's role needed to be the one in the deployment's audience (a mapping for another role fails with `INSUFFICIENT_PERMISSION`).
- **A certificate can be mapped once.** Regenerating a key pair after uploading its certificate leaves that mapping unusable.

## Decision

Automated verification works for the RESTlet path, so [#74](https://github.com/nemchik/biome-plugin-suitescript/issues/74) is satisfied for that path. The setup guide ([automation.md](../automation.md)) records the integration flags and the role permissions. Other script types are follow-up issues.
