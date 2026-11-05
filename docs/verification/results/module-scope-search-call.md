# A search at module scope

- **NetSuite version:** 2026.2
- **Account type:** sandbox
- **Date:** 2026-11-05
- **Method:** deployed RESTlet (the verification runner)
- **Script type:** RESTlet
- **Probe:** [verification/probes/module-scope-search-call.js](../../../verification/probes/module-scope-search-call.js)
- **Contradictions settled:** C-011
- **Issue:** [#69](https://github.com/nemchik/biome-plugin-suitescript/issues/69)

## Test

```js
/**
 * Does running a search at module scope (while `define()` runs) fail? The SAFE
 * guide says N/ APIs are unavailable during the define() callback and that
 * calling them "causes deployment failure". A combined probe that also loaded
 * and created records stopped the runner loading; this one isolates the
 * search. A failure that try/catch cannot capture makes every probe return
 * HTTP 400, which is itself the evidence.
 *
 * @NApiVersion 2.1
 * @scriptType Restlet
 * @contradiction C-011
 * @rule noModuleScopeApiCalls
 */
define(["N/search"], (search) => {
    const early = {};
    try {
        const rows = search
            .create({ type: "customer", columns: ["entityid"] })
            .run()
            .getRange({ start: 0, end: 1 });
        early["search.create().run().getRange() at module scope"] =
            `rows: ${rows.length}`;
    } catch (e) {
        early["search.create().run().getRange() at module scope"] =
            `THROWS: ${e.name}: ${e.message}`;
    }
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
    "search.create().run().getRange() at module scope": "THROWS: SSS_USAGE_LIMIT_EXCEEDED: Script Execution Usage Limit Exceeded"
}
```

## Explanation

`search.create(...).run().getRange(...)` at module scope throws `SSS_USAGE_LIMIT_EXCEEDED: Script Execution Usage Limit Exceeded`. The script's usage allowance is not available while `define()` runs, so a call that consumes governance units fails; a call that does not (`runtime`, `search.createColumn`, see [module-scope-runtime-calls](module-scope-runtime-calls.md)) works. The error is catchable and does not by itself stop the script loading. An earlier combined probe (`search.create().run().getRange()` plus `record.create()` and `record.load()` at module scope) did stop the runner loading, so every probe returned HTTP 400 (`ScriptNullObjectAdapter`) until that probe was removed; which of the record calls caused it was not isolated and the combined probe is not kept in the repository.

## Decision

C-011 is partly verified: governed calls fail at module scope, but `runtime.getCurrentScript()` does not, and a failure is a catchable usage-limit error and not a deployment failure for the search. `noModuleScopeApiCalls` keeps its severity for now; narrowing it to governed calls is a follow-up. `record.create` and `record.load` at module scope are not isolated yet.
