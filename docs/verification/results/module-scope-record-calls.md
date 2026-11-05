# `record.create` and `record.load` at module scope

- **NetSuite version:** 2026.2
- **Account type:** sandbox
- **Date:** 2026-11-05
- **Method:** deployed RESTlet (the verification runner), one probe at a time
- **Script type:** RESTlet
- **Probe:** none kept in the repository: each probe stopped the runner loading, so they were removed after the test and their code is below
- **Contradictions settled:** C-011
- **Issue:** [#69](https://github.com/nemchik/biome-plugin-suitescript/issues/69)

## Test

Two probes, each deployed alone as a dependency of the runner (the runner loads probes in its own `define()`, so their top-level code runs while the module is being defined). Each wrapped its one call in `try/catch`.

```js
define(["N/record"], (record) => {
    const early = {};
    try {
        early["record.create() at module scope"] = typeof record.create({
            type: "customer",
        });
    } catch (e) {
        early["record.create() at module scope"] =
            `THROWS: ${e.name}: ${e.message}`;
    }
    return {
        run() {
            return early;
        },
    };
});
```

```js
define(["N/record"], (record) => {
    const early = {};
    try {
        early["record.load() at module scope"] = typeof record.load({
            type: "customer",
            id: 999999999, // an id that does not exist
        });
    } catch (e) {
        early["record.load() at module scope"] =
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

| Deployed with the runner                    | Result                                                                                                                      |
| ------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `record.create` probe only                  | Every call, `probe-zero` included, returned `HTTP 400`: `com.netsuite.suitescript.scriptobject.ScriptNullObjectAdapter@...` |
| `record.load` probe only                    | The same `HTTP 400` for every call                                                                                          |
| neither (and the search and runtime probes) | The runner loaded and `probe-zero` passed                                                                                   |

## Explanation

Either call at module scope stops the runner from loading, in a way the probe's own `try/catch` does not capture, so the SAFE guide's claim that an N/ call at module scope "causes deployment failure" holds for `record.create` and `record.load`. This differs from a search at module scope (a catchable `SSS_USAGE_LIMIT_EXCEEDED`, see [module-scope-search-call](module-scope-search-call.md)) and from `runtime.getCurrentScript()` and `search.createColumn()` (they work, see [module-scope-runtime-calls](module-scope-runtime-calls.md)). The error message names no module, so a single failing call is found by deploying one probe at a time. A guess at the mechanism (not tested): the record APIs fail while the script is still loading in a way that unwinds the whole module load, while the search API reports a usage error that JavaScript can catch.

A nonexistent id was used for `record.load`, so the failure is the module-scope call and not a missing record: the error never reached a "record not found" result.

## Decision

C-011 is settled by the three module-scope pages together. `record.create` and `record.load` at module scope fail the load (the claim holds, and the SAFE guide's own `record.load` example is the failing case); a search fails with a catchable usage error; `runtime` and the object builders work. `noModuleScopeApiCalls` is right to flag the record calls and wrong to flag `runtime.getCurrentScript()`; narrowing it is [#86](https://github.com/nemchik/biome-plugin-suitescript/issues/86). Whether another script type behaves the same is not tested.
