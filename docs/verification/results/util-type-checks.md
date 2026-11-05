# N/util type checks (`isArray`, `isString`, `isNumber`, `isBoolean`, `isFunction`, `isAsyncFunction`, `isDate`, `isRegExp`)

- **NetSuite version:** 2026.2
- **Account type:** sandbox
- **Date:** 2026-11-04
- **Method:** browser console (client) and script debugger (server); the results were identical
- **Contradictions settled:** C-009, C-014
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
    t("isString boxed", () => u.isString(new String("a")));
    t("isNumber boxed", () => u.isNumber(new Number(1)));
    t("isNumber NaN", () => u.isNumber(NaN));
    t("isBoolean boxed", () => u.isBoolean(new Boolean(false)));
    t("isFunction async", () => u.isFunction(async () => {}));
    t("isAsyncFunction async", () => u.isAsyncFunction(async () => {}));
    t("isAsyncFunction sync", () => u.isAsyncFunction(() => {}));
    t("isDate invalid", () => u.isDate(new Date("x")));
    t("isRegExp", () => u.isRegExp(/a/));
    t("isArray []", () => u.isArray([]));
    console.log(JSON.stringify(r, null, 1));
});
```

## Results

```json
{
    "isString boxed": true,
    "isNumber boxed": true,
    "isNumber NaN": true,
    "isBoolean boxed": true,
    "isFunction async": true,
    "isAsyncFunction async": true,
    "isAsyncFunction sync": false,
    "isDate invalid": true,
    "isRegExp": true,
    "isArray []": true
}
```

## Explanation

- `isString`, `isNumber` and `isBoolean` accept boxed values (`new String('a')`) as well as primitives. The Oracle member pages say "String object or primitive"; the module page's table says "a value that evaluates to" one. A bare `typeof x === 'string'` is false for a boxed string, so `typeof` is a lookalike, not an exact equivalent. The type definitions' guards (`obj is string`) do not mention boxed values either way.
- `isNumber(NaN)` is true, as is `typeof NaN === 'number'`.
- `isFunction` is true for an async function, as is `typeof x === 'function'`.
- `isAsyncFunction` works at runtime, as Oracle documents. The type definitions do not declare it (C-009).
- `isDate` accepts an invalid `Date`, like `x instanceof Date`.

## Decision

`preferUtilTypeChecks` flags the common native equivalents of these checks. Its documentation says that the `typeof` forms for string, number and boolean differ from `util` only for boxed values, which are rare, and that the `Object.prototype.toString.call(x)` forms match exactly. `util.isAsyncFunction` is valid even though the type definitions omit it.
