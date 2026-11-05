# `log` and `util` are globals without loading `N/log` or `N/util`

- **NetSuite version:** 2026.2
- **Account type:** sandbox
- **Date:** 2026-11-05
- **Method:** deployed RESTlet (the verification runner)
- **Script type:** RESTlet
- **Probe:** [verification/probes/globals-log-util.js](../../../verification/probes/globals-log-util.js)
- **Contradictions settled:** C-001
- **Issue:** [#68](https://github.com/nemchik/biome-plugin-suitescript/issues/68)

## Test

```js
/**
 * Are `log` and `util` globals in a deployed server script, and are they the
 * same objects as the `N/log` and `N/util` modules? The learning skill says
 * N/log is "not globally available"; the upgrade skill and Oracle's `util
 * Object` page say it is loaded by default.
 *
 * @NApiVersion 2.1
 * @scriptType Restlet
 * @contradiction C-001
 * @rule noGlobalShadowing
 */
define(["N/log", "N/util"], (logModule, utilModule) => ({
    run() {
        const result = {};
        const t = (key, fn) => {
            try {
                result[key] = fn();
            } catch (e) {
                result[key] = `THROWS: ${e.name}: ${e.message}`;
            }
        };
        t("typeof log (global)", () => typeof log);
        t("typeof util (global)", () => typeof util);
        t("log.debug works as a global", () => {
            log.debug("probe", "global log works");
            return "ok";
        });
        t("N/log module is the global log", () => logModule === log);
        t("N/util module is the global util", () => utilModule === util);
        t("util.isArray works as a global", () => util.isArray([]));
        return result;
    },
}));
```

## Results

```json
{
    "typeof log (global)": "object",
    "typeof util (global)": "object",
    "log.debug works as a global": "ok",
    "N/log module is the global log": true,
    "N/util module is the global util": true,
    "util.isArray works as a global": true
}
```

## Explanation

`log` and `util` exist as globals in a deployed RESTlet, `log.debug` works through the global, and the global objects are the same objects the `N/log` and `N/util` modules return. The learning skill's claim that `N/log` is "not globally available" is false for a RESTlet; Oracle's documentation and the upgrade skill are right. Other script types and the client are not tested here: the client half of #68 needs a browser and the other server script types need the runner to cover them.

## Decision

[ADR 0006](../../adr/0006-suitescript-globals-have-two-opposite-loading-styles.md) already follows the documentation, and this confirms it for RESTlets. C-001 is verified for server scripts of that type; the client and the other script types stay unchecked. No rule changes.
