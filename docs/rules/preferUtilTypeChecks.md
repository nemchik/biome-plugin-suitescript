<!--
  This page is generated. Do not edit it by hand: manual edits will be rejected.
  To change it, edit the rule's entry in scripts/rule-sources.ts (description, sources,
  opt-in reason) or the fixture and cases in test/cases.ts, then run `npm run build`
  and `npm run docs` and commit the result. See docs/rule-priority.md.
-->

# `preferUtilTypeChecks`

Use `util.isArray`/`isString`/`isNumber`/`isBoolean`/`isFunction`/`isAsyncFunction`/`isDate`/`isRegExp` instead of the native patterns (`Array.isArray`, `typeof`, `instanceof`, `Object.prototype.toString.call`); `typeof` differs only for boxed values.

- **Severity:** warn
- **Presets:** all

## Example

Flagged when this rule alone is enabled:

```js
Array.isArray(value);
```

Reported as warning: Use util.isArray() instead of `Array.isArray(value)`. (`r-util-prefer.js`, line 4).

## Rule source

- Tier 4: [house preference](https://github.com/nemchik/biome-plugin-suitescript/blob/main/docs/rule-priority.md#source-tiers)
- Verified: [util-type-checks](https://github.com/nemchik/biome-plugin-suitescript/blob/main/docs/verification/results/util-type-checks.md)
- Verified: [util-isobject](https://github.com/nemchik/biome-plugin-suitescript/blob/main/docs/verification/results/util-isobject.md)

Enable it with `"plugins": ["biome-plugin-suitescript/preferUtilTypeChecks"]` or through a preset. See the [README](https://github.com/nemchik/biome-plugin-suitescript#readme).
