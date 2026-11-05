# `util.nanoTime`

- **NetSuite version:** 2026.2
- **Account type:** sandbox
- **Date:** 2026-11-05
- **Method:** browser console (client), script debugger (server) and a deployed RESTlet (server, the verification runner)
- **Script type:** RESTlet (deployed), client and debugger as listed
- **Probe:** [verification/probes/util-nanotime.js](../../../verification/probes/util-nanotime.js)
- **Contradictions settled:** C-010 for server scripts. The type definitions declare a function that exists but cannot be called.
- **Issue:** #67

## Test

The first run, in the browser console (client) and the script debugger (server):

```js
require(["N/util"], function (u) {
    const r = {},
        t = (k, f) => {
            try {
                r[k] = f();
            } catch (e) {
                r[k] = "THROWS: " + e.message;
            }
        };
    t("nanoTime typeof", () => typeof u.nanoTime());
    t("nanoTime delta", () => {
        const a = u.nanoTime();
        const b = u.nanoTime();
        return [a, b, b - a];
    });
    t("typeof performance", () => typeof performance);
    t("typeof process", () => typeof process);
    console.log(JSON.stringify(r, null, 1));
});
```

The deployed run is the probe [verification/probes/util-nanotime.js](../../../verification/probes/util-nanotime.js), run by the verification runner.

## Results

| Check                  | Client (browser console)               | Server (script debugger)                                 | Server (deployed RESTlet)                                           |
| ---------------------- | -------------------------------------- | -------------------------------------------------------- | ------------------------------------------------------------------- |
| `typeof util.nanoTime` | `undefined`                            | `function`                                               | `function`                                                          |
| `u.nanoTime()`         | `THROWS: u.nanoTime is not a function` | `THROWS: Cannot read property 'nsNanoTime' of undefined` | `THROWS: TypeError: Cannot read property 'nsNanoTime' of undefined` |
| `typeof performance`   | `object`                               | `undefined`                                              | `undefined` (probe zero)                                            |
| `typeof process`       | `undefined`                            | `undefined`                                              | `undefined` (probe zero)                                            |

Deployed RESTlet output (`verification/probes/util-nanotime.expect.json`):

```json
{
    "typeof util.nanoTime": "function",
    "nanoTime() typeof": "THROWS: TypeError: Cannot read property 'nsNanoTime' of undefined",
    "nanoTime() is non-decreasing": "THROWS: TypeError: Cannot read property 'nsNanoTime' of undefined"
}
```

## Explanation

On the client `util.nanoTime` does not exist. On the server it exists, but calling it throws, in the debugger and in a deployed RESTlet alike. The error looks like an internal bridge object (`nsNanoTime`) that the server runtime does not provide, so the function is declared and exposed but unusable. The type definitions declare `nanoTime(): number`; Oracle has no help-center page for it and omits it from the `N/util` method table. There is no native high-resolution timer to use instead: neither `performance` nor `process` exists on the server.

## Decision

Treat `util.nanoTime` as unusable in a server script. No rule concerns it. The claim that blocked reporting it upstream (that the debugger result might not hold for a deployed script) is settled, so reporting it to the type definitions project is now justified; that is a human decision and is not done here.
