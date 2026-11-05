# `util.nanoTime`

- **NetSuite version:** 2026.2
- **Account type:** sandbox
- **Date:** 2026-11-04
- **Method:** browser console (client) and script debugger (server). **Incomplete:** no deployed script has run yet (#67).
- **Contradictions settled:** none yet (C-010 stays unverified)
- **Issue:** #67

## Test

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

## Results

| Check                | Client (browser console)               | Server (script debugger)                                 |
| -------------------- | -------------------------------------- | -------------------------------------------------------- |
| `u.nanoTime()`       | `THROWS: u.nanoTime is not a function` | `THROWS: Cannot read property 'nsNanoTime' of undefined` |
| `typeof performance` | `object`                               | `undefined`                                              |
| `typeof process`     | `undefined`                            | `undefined`                                              |

## Explanation

On the client `util.nanoTime` does not exist. In the server debugger it exists but throws, which looks like an internal bridge object the debugger does not provide, so the debugger result may not hold for a deployed script. The type definitions declare `nanoTime(): number`; Oracle has no help-center page for it and omits it from the `N/util` method table. Neither `performance` nor `process` exists in the server debugger, so there is no native high-resolution timer to prefer it over there.

## Decision

No rule concerns `nanoTime`. Whether it works in a deployed server script is open (#67). Do not open an issue with the type definitions project until that is confirmed.
