<!--
  This page is generated. Do not edit it by hand: manual edits will be rejected.
  To change it, edit the rule's entry in scripts/rule-sources.ts (description, sources,
  opt-in reason) or the fixture and cases in test/cases.ts, then run `npm run build`
  and `npm run docs` and commit the result. See docs/rule-priority.md.
-->

# `preferUtilEach`

Use `util.each` instead of `forEach` on an array literal or `Object.keys/values/entries(o)` (a bare `x.forEach` is skipped: `util.each` does nothing for a `Set` or `Map`).

- **Severity:** warn
- **Presets:** all

## Example

Flagged when this rule alone is enabled:

```js
[1, 2].forEach((n) => n);
```

Reported as warning: Use util.each(array, callback) instead of .forEach(). (`r-util-prefer.js`, line 40).

## Rule source

- Tier 4: [house preference](https://github.com/nemchik/biome-plugin-suitescript/blob/main/docs/rule-priority.md#source-tiers)
- Verified: [util-each](https://github.com/nemchik/biome-plugin-suitescript/blob/main/docs/verification/results/util-each.md)

Enable it with `"plugins": ["biome-plugin-suitescript/preferUtilEach"]` or through a preset. See the [README](https://github.com/nemchik/biome-plugin-suitescript#readme).
