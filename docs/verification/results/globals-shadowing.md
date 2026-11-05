# Binding `N/log` to `util` and `N/util` to `log`

- **NetSuite version:** 2026.2
- **Account type:** sandbox
- **Date:** 2026-11-05
- **Method:** deployed RESTlet (the verification runner)
- **Script type:** RESTlet
- **Probe:** [verification/probes/globals-shadowing.js](../../../verification/probes/globals-shadowing.js)
- **Contradictions settled:** C-001
- **Issue:** [#68](https://github.com/nemchik/biome-plugin-suitescript/issues/68)

## Test

```js
/**
 * What happens when a module parameter reuses the name of the other global
 * (`N/log` bound to `util`, `N/util` bound to `log`)? The upgrade skill says
 * renaming `log` or `util` "can break logging or utility calls".
 *
 * @NApiVersion 2.1
 * @scriptType Restlet
 * @contradiction C-001
 * @rule noGlobalShadowing
 */
define(["N/log", "N/util"], (util, log) => ({
    run() {
        const result = {};
        const t = (key, fn) => {
            try {
                result[key] = fn();
            } catch (e) {
                result[key] = `THROWS: ${e.name}: ${e.message}`;
            }
        };
        t("util (bound to N/log): typeof debug", () => typeof util.debug);
        t("util (bound to N/log): typeof isArray", () => typeof util.isArray);
        t("log (bound to N/util): typeof isArray", () => typeof log.isArray);
        t("log (bound to N/util): typeof debug", () => typeof log.debug);
        t("log.isArray([]) on the shadowing binding", () => log.isArray([]));
        t("util.debug call on the shadowing binding", () => {
            util.debug("probe", "N/log bound to util");
            return "ok";
        });
        return result;
    },
}));
```

## Results

```json
{
    "util (bound to N/log): typeof debug": "function",
    "util (bound to N/log): typeof isArray": "undefined",
    "log (bound to N/util): typeof isArray": "function",
    "log (bound to N/util): typeof debug": "undefined",
    "log.isArray([]) on the shadowing binding": true,
    "util.debug call on the shadowing binding": "ok"
}
```

## Explanation

Nothing fails on upload or at runtime. The module parameter simply wins inside that module: `util` bound to `N/log` has `debug` and no `isArray`, `log` bound to `N/util` has `isArray` and no `debug`. So the upgrade skill's claim that renaming `log` or `util` "can break logging or utility calls" is true only in the narrow sense that the global of that name is hidden inside the module that rebinds it, so code that expects the global then calls the wrong object. Nothing breaks at deployment, and a rebinding that is used consistently works.

## Decision

`noGlobalShadowing` stays: the shadowing is a real hazard, but the platform does not enforce it, so its message should not suggest a failure. Rewording or re-grading it is a follow-up and is not done here.
