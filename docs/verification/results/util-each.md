# `util.each`

- **NetSuite version:** 2026.2
- **Account type:** sandbox
- **Date:** 2026-11-04
- **Method:** browser console (client) and script debugger (server); the results were identical
- **Contradictions settled:** none (Oracle's page says "Object or Array" and is silent on early exit and inherited keys)
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
    t("each array args", () => {
        const a = [];
        u.each(["x", "y"], (...args) => a.push(args.length));
        return a;
    });
    t("each array return false", () => {
        let n = 0;
        u.each([1, 2, 3], () => {
            n++;
            return false;
        });
        return n;
    });
    t("each object args", () => {
        const a = [];
        u.each({ k: "v" }, (v, k) => a.push([v, k]));
        return a;
    });
    t("each inherited keys", () => {
        const a = [];
        u.each(child, (v, k) => a.push(k));
        return a;
    });
    t("each returns collection", () => {
        const x = [1];
        return u.each(x, () => {}) === x;
    });
    t("each Set", () => {
        let n = 0;
        u.each(new Set([1, 2]), () => n++);
        return n;
    });
    t("each Map", () => {
        let n = 0;
        u.each(new Map([[1, 2]]), () => n++);
        return n;
    });
    t("each string", () => {
        let n = 0;
        u.each("ab", () => n++);
        return n;
    });
    console.log(JSON.stringify(r, null, 1));
});
```

## Results

```json
{
    "each array args": [3, 3],
    "each array return false": 3,
    "each object args": [["v", "k"]],
    "each inherited keys": ["own"],
    "each returns collection": true,
    "each Set": 0,
    "each Map": 0,
    "each string": 2
}
```

## Explanation

- `util.each` iterates arrays (the callback gets three arguments, like `forEach`) and the own keys of plain objects (the callback gets `(value, key)`). It is not specific to NetSuite collections.
- It does not iterate a `Set` or a `Map` (zero calls), though it does iterate a string.
- Returning `false` does not stop it: there is no early exit.
- It returns the original collection, where `forEach` returns `undefined`.

## Decision

`preferUtilEach` flags `forEach` only where the receiver is certainly an array: `Object.keys(o).forEach`, `Object.values(o).forEach`, `Object.entries(o).forEach` and an array literal. A bare `x.forEach(...)` is not flagged, because `x` may be a `Set` or a `Map`, which `util.each` silently skips. `for...of` and `for...in` are not flagged: `util.each` has no early exit, and `for...in` walks inherited keys.
