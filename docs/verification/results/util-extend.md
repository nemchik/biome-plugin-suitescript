# `util.extend`

- **NetSuite version:** 2026.2
- **Account type:** sandbox
- **Date:** 2026-11-04
- **Method:** browser console (client) and script debugger (server); the results were identical
- **Contradictions settled:** none (Oracle's page is silent on copy depth and inherited properties)
- **Issue:** #46

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
    const proto = { inherited: 1 };
    const child = Object.create(proto);
    child.own = 2;
    t("extend returns receiver", () => {
        const a = {};
        return u.extend(a, { x: 1 }) === a;
    });
    t("extend inherited", () => Object.keys(u.extend({}, child)));
    t("extend deep is shared", () => {
        const o = { n: {} };
        return u.extend({}, o).n === o.n;
    });
    t("extend null contributor", () => u.extend({ a: 1 }, null));
    console.log(JSON.stringify(r, null, 1));
});
```

## Results

```json
{
    "extend returns receiver": true,
    "extend inherited": ["own"],
    "extend deep is shared": true,
    "extend null contributor": { "a": 1 }
}
```

## Explanation

`util.extend(receiver, contributor)` mutates and returns the receiver, copies only the contributor's own enumerable properties, copies shallowly (nested objects are shared) and accepts a `null` contributor. That is the behavior of `Object.assign(receiver, contributor)`. Object spread (`{ ...a, ...b }`) creates a new object and does not mutate the receiver, and a `for...in` copy loop also copies inherited properties, so both are lookalikes.

## Decision

`preferUtilExtend` flags `Object.assign(receiver, contributor)` only. Spread and `for...in` copies are not flagged, because replacing them with `util.extend` changes behavior.
