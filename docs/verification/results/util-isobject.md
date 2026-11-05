# `util.isObject`

- **NetSuite version:** 2026.2
- **Account type:** sandbox
- **Date:** 2026-11-04
- **Method:** browser console (client) and script debugger (server); the results were identical apart from the wording of the last error
- **Contradictions settled:** C-013
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
    class C {}
    t("isObject {}", () => u.isObject({}));
    t("isObject []", () => u.isObject([]));
    t("isObject null", () => u.isObject(null));
    t("isObject Date", () => u.isObject(new Date()));
    t("isObject fn", () => u.isObject(function () {}));
    t("isObject class instance", () => u.isObject(new C()));
    t("isObject Object.create(null)", () => u.isObject(Object.create(null)));
    console.log(JSON.stringify(r, null, 1));
});
```

## Results

```json
{
    "isObject {}": true,
    "isObject []": false,
    "isObject null": false,
    "isObject Date": false,
    "isObject fn": false,
    "isObject class instance": false,
    "isObject Object.create(null)": "THROWS: b.hasOwnProperty is not a function"
}
```

In the debugger the last message read `obj.hasOwnProperty is not a function`.

## Explanation

`util.isObject` is true only for plain objects, as Oracle's page says ("a plain JavaScript object"). It is false for arrays, dates, functions, class instances and `null`, and it throws for an object with no prototype. The type definitions type it as `obj is object`, which is broader than the behavior (C-013).

No common native pattern matches it. `typeof x === 'object' && x !== null` is true for arrays, dates and class instances, and `Object.prototype.toString.call(x) === '[object Object]'` is true for class instances.

## Decision

No rule prefers `util.isObject` over a native check: replacing any native pattern with it can change behavior. Code that wants a plain-object check can use it knowing the results above.
