# The global `toString()` and `instanceof` on SuiteScript objects

- **NetSuite version:** 2026.2
- **Account type:** sandbox
- **Date:** 2026-11-05
- **Method:** deployed RESTlet (the verification runner)
- **Script type:** RESTlet
- **Probe:** [verification/probes/global-tostring.js](../../../verification/probes/global-tostring.js)
- **Contradictions settled:** C-015
- **Issue:** [#73](https://github.com/nemchik/biome-plugin-suitescript/issues/73)

## Test

```js
/**
 * Oracle documents a global `toString()` method as the replacement for
 * `instanceof` on SuiteScript objects, and says `instanceof` is not supported
 * for them. What do both do in a deployed script?
 *
 * @NApiVersion 2.1
 * @scriptType Restlet
 * @contradiction C-015
 */
define(["N/search", "N/runtime"], (search, runtime) => ({
    run() {
        const result = {};
        const t = (key, fn) => {
            try {
                result[key] = fn();
            } catch (e) {
                result[key] = `THROWS: ${e.name}: ${e.message}`;
            }
        };
        const objects = {
            search: () =>
                search.create({ type: "customer", columns: ["entityid"] }),
            column: () => search.createColumn({ name: "entityid" }),
            user: () => runtime.getCurrentUser(),
            script: () => runtime.getCurrentScript(),
        };
        t("typeof toString", () => typeof toString);
        for (const [name, make] of Object.entries(objects)) {
            t(`${name}: toString(obj)`, () => toString(make()));
            t(`${name}: obj.toString()`, () => make().toString());
            t(`${name}: Object.prototype.toString.call`, () =>
                Object.prototype.toString.call(make()),
            );
            t(`${name}: instanceof Object`, () => make() instanceof Object);
            t(`${name}: instanceof Array`, () => make() instanceof Array);
        }
        t("typeof search.Search", () => typeof search.Search);
        t(
            "search instanceof search.Search",
            () => objects.search() instanceof search.Search,
        );
        t("[] instanceof Array", () => [] instanceof Array);
        t("new Date() instanceof Date", () => new Date() instanceof Date);
        return result;
    },
}));
```

## Results

```json
{
    "[] instanceof Array": true,
    "column: Object.prototype.toString.call": "[object Object]",
    "column: instanceof Array": false,
    "column: instanceof Object": true,
    "column: obj.toString()": "search.Column",
    "column: toString(obj)": "[object Undefined]",
    "new Date() instanceof Date": true,
    "script: Object.prototype.toString.call": "[object Object]",
    "script: instanceof Array": false,
    "script: instanceof Object": true,
    "script: obj.toString()": "runtime.Script",
    "script: toString(obj)": "[object Undefined]",
    "search instanceof search.Search": "THROWS: TypeError: Right-hand-side of instanceof is not an object",
    "search: Object.prototype.toString.call": "[object Object]",
    "search: instanceof Array": false,
    "search: instanceof Object": true,
    "search: obj.toString()": "search.Search",
    "search: toString(obj)": "[object Undefined]",
    "typeof search.Search": "undefined",
    "typeof toString": "function",
    "user: Object.prototype.toString.call": "[object Object]",
    "user: instanceof Array": false,
    "user: instanceof Object": true,
    "user: obj.toString()": "runtime.User",
    "user: toString(obj)": "[object Undefined]"
}
```

## Explanation

`obj.toString()` returns a type name for SuiteScript objects (`search.Search`, `search.Column`, `runtime.User`, `runtime.Script`), as Oracle describes. The global function form `toString(obj)` returns `[object Undefined]` rather than a name, so the working form is the method on the object. `instanceof Object` and `instanceof Array` do not throw for these objects (they return `true` and `false`). `search.Search` is not a constructor here, so `obj instanceof search.Search` throws `Right-hand-side of instanceof is not an object`: that, not a throw on the left-hand side, is why `instanceof` cannot test for a SuiteScript type. Oracle's claim that `instanceof` throws on SuiteScript objects is not reproduced for the objects tried. Record objects were not tested (the sandbox role lacks the Customers permission).

## Decision

No rule yet. If one is written it should steer `x instanceof <N/ member>` to `x.toString()`, not flag every `instanceof`. Whether the global `toString()` is a third global for ADR 0006 is answered no: the working form is a method on each object, not a global function. C-015 is partly verified (see the contradictions table).
