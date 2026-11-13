# What `https.requestSuitelet` accepts from a RESTlet

- **NetSuite version:** 2026.2
- **Account type:** sandbox
- **Date:** 2026-11-13
- **Method:** deployed RESTlet (the suitescript-verify runner)
- **Script type:** RESTlet
- **Probe:** [verification/probes/https-request-suitelet.js](../../../verification/probes/https-request-suitelet.js)
- **Contradictions settled:** C-016 (option names only; see Decision)
- **Issue:** [#130](https://github.com/nemchik/biome-plugin-suitescript/issues/130)

## Test

```js
/**
 * Can a RESTlet reach a Suitelet with `https.requestSuitelet`? A real call
 * needs a deployed Suitelet, so this reports what the call does without one:
 * whether the method exists and which error each bad input throws. Oracle
 * validates `scriptId`, `deploymentId` and `urlParams`; the SAFE guide uses a
 * `params` option; the type definitions say only `external: true` works.
 *
 * @NApiVersion 2.1
 * @scriptType Restlet
 * @contradiction C-016
 */
define(["N/https"], (https) => ({
    run() {
        const result = {};
        const t = (key, fn) => {
            try {
                const r = fn();
                result[key] = `returned ${typeof r}`;
            } catch (e) {
                result[key] = `THROWS: ${e.name}: ${e.message}`;
            }
        };
        result.typeofRequestSuitelet = typeof https.requestSuitelet;
        result.typeofPromise = typeof https.requestSuitelet?.promise;
        t("no options", () => https.requestSuitelet({}));
        t("scriptId only", () =>
            https.requestSuitelet({ scriptId: "customscript_nonexistent" }),
        );
        t("deploymentId only", () =>
            https.requestSuitelet({ deploymentId: "customdeploy_nonexistent" }),
        );
        t("nonexistent script and deployment", () =>
            https.requestSuitelet({
                deploymentId: "customdeploy_nonexistent",
                scriptId: "customscript_nonexistent",
            }),
        );
        t("nonexistent, SAFE guide params option", () =>
            https.requestSuitelet({
                deploymentId: "customdeploy_nonexistent",
                params: { action: "getData" },
                scriptId: "customscript_nonexistent",
            }),
        );
        t("nonexistent, urlParams as a string", () =>
            https.requestSuitelet({
                deploymentId: "customdeploy_nonexistent",
                scriptId: "customscript_nonexistent",
                urlParams: "a=b",
            }),
        );
        t("nonexistent, external true", () =>
            https.requestSuitelet({
                deploymentId: "customdeploy_nonexistent",
                external: true,
                scriptId: "customscript_nonexistent",
            }),
        );
        t("nonexistent, Authorization header", () =>
            https.requestSuitelet({
                deploymentId: "customdeploy_nonexistent",
                headers: { Authorization: "Bearer x" },
                scriptId: "customscript_nonexistent",
            }),
        );
        // The runner is a RESTlet, so Oracle's SSS_INVALID_SCRIPT_ID_1 ("does not
        // reference a Suitelet script") should fire if the script lookup runs.
        t("a RESTlet script id", () =>
            https.requestSuitelet({
                deploymentId: "customdeploy_suitescript_verify_runner",
                scriptId: "customscript_suitescript_verify_runner",
            }),
        );
        return result;
    },
}));
```

## Results

```json
{
    "typeofRequestSuitelet": "function",
    "typeofPromise": "function",
    "no options": "THROWS: SSS_MISSING_REQD_ARGUMENT: https.requestSuitelet: Missing a required argument: options.scriptId",
    "scriptId only": "THROWS: SSS_MISSING_REQD_ARGUMENT: https.requestSuitelet: Missing a required argument: options.deploymentId",
    "deploymentId only": "THROWS: SSS_MISSING_REQD_ARGUMENT: https.requestSuitelet: Missing a required argument: options.scriptId",
    "nonexistent script and deployment": "THROWS: UNEXPECTED_ERROR: An unexpected SuiteScript error has occurred",
    "nonexistent, SAFE guide params option": "THROWS: UNKNOWN_PARAM: Unknown parameter: deploymentId, scriptId.",
    "nonexistent, urlParams as a string": "THROWS: SSS_INVALID_TYPE_ARG: You have entered an invalid type argument: options.urlParams",
    "nonexistent, external true": "THROWS: REQUEST_SUITELET_NO_LONGER_SUPPORTS_EXTERNAL_PARAMETER: SuiteScript API `https.requestSuitelet()` no longer supports `external` parameter.",
    "nonexistent, Authorization header": "THROWS: UNEXPECTED_ERROR: An unexpected SuiteScript error has occurred",
    "a RESTlet script id": "returned object"
}
```

## Explanation

No Suitelet was called, so this page says what the method accepts and rejects, not whether a Suitelet answers.

- **The method exists in a RESTlet** (`https.requestSuitelet` and its `.promise` are functions), in line with Oracle's note that it is supported in server scripts.
- **`scriptId` and `deploymentId` are both required** (`SSS_MISSING_REQD_ARGUMENT`, naming the missing option), and `urlParams` must not be a string (`SSS_INVALID_TYPE_ARG`). That matches Oracle's option list.
- **The SAFE guide's `params` option is not accepted.** The call fails with `UNKNOWN_PARAM`, so pitfall 104's example does not run as written. (The error text names `deploymentId` and `scriptId` as the unknown parameters; the probe cannot say why, so this page only records that the call with `params` fails and the same call without it reached a different error.)
- **`external: true` is rejected** with `REQUEST_SUITELET_NO_LONGER_SUPPORTS_EXTERNAL_PARAMETER`. Oracle says the option was removed in 2024.1; the type definitions still describe `external: true` as the supported form, which is wrong on 2026.2.
- **A nonexistent script and deployment** gives the generic `UNEXPECTED_ERROR`, not a named error. An `Authorization` header gives the same error, not Oracle's `SSS_AUTHORIZATION_HEADER_NOT_ALLOWED`, but because the script does not exist this does not show that the header check is absent.
- **The runner's own script id** (a RESTlet) returned an object. Oracle says a script that is not a Suitelet should throw `SSS_INVALID_SCRIPT_ID_1`. The probe did not inspect the returned object, so this page does not say what it contained or whether it was an error response.

## Decision

No rule depends on this. C-016 is marked verified for the option names only: `scriptId`, `deploymentId` and `urlParams` are the accepted options, and neither the SAFE guide's `params` nor the type definitions' `external` works. Whether a Suitelet answers a RESTlet's call stays untested, so Suitelet support stays out of v1 as #130 says and needs a separate decision. The returned-object result for a RESTlet script id needs a follow-up probe that inspects the object before it is used as evidence.
