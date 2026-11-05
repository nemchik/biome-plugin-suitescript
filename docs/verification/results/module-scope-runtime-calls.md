# `runtime` and `search.createColumn` at module scope

- **NetSuite version:** 2026.2
- **Account type:** sandbox
- **Date:** 2026-11-05
- **Method:** deployed RESTlet (the verification runner)
- **Script type:** RESTlet
- **Probe:** [verification/probes/module-scope-runtime-calls.js](../../../verification/probes/module-scope-runtime-calls.js)
- **Contradictions settled:** C-011
- **Issue:** [#69](https://github.com/nemchik/biome-plugin-suitescript/issues/69)

## Test

```js
/**
 * Does calling `runtime` or `search.createColumn` at module scope (while
 * `define()` runs) fail? The SAFE guide says "All N/ API modules are
 * unavailable during the define() callback execution". Each call is captured as
 * data. This is the first, lowest-risk step of splitting a probe that stopped
 * the runner from loading: a failure that try/catch cannot capture makes every
 * probe return HTTP 400, which is itself the evidence.
 *
 * @NApiVersion 2.1
 * @scriptType Restlet
 * @contradiction C-011
 * @rule noModuleScopeApiCalls
 */
define(["N/runtime", "N/search"], (runtime, search) => {
    const early = {};
    const t = (key, fn) => {
        try {
            early[key] = fn();
        } catch (e) {
            early[key] = `THROWS: ${e.name}: ${e.message}`;
        }
    };
    t(
        "runtime.getCurrentScript() at module scope",
        () => typeof runtime.getCurrentScript(),
    );
    t("runtime.envType at module scope", () => String(runtime.envType));
    t(
        "search.createColumn() at module scope",
        () => typeof search.createColumn({ name: "entityid" }),
    );
    return {
        run() {
            return early;
        },
    };
});
```

## Results

```json
{
    "runtime.getCurrentScript() at module scope": "object",
    "runtime.envType at module scope": "SANDBOX",
    "search.createColumn() at module scope": "object"
}
```

## Explanation

`runtime.getCurrentScript()`, `runtime.envType` and `search.createColumn()` all work at module scope, while `define()` runs. The SAFE guide says `runtime.getCurrentScript()` at module scope "causes deployment failure"; in a RESTlet it does not. The runner loads each probe as a dependency of its own `define()`, so the calls did run while the module was being defined.

## Decision

Recorded only. The SAFE guide's example is refuted for `runtime.getCurrentScript()` in a RESTlet, and `noModuleScopeApiCalls` flags it. Re-grading or narrowing that rule is a follow-up, not done here (see [module-scope-search-call](module-scope-search-call.md) for the governed calls that do fail).
