<!--
  This page is generated. Do not edit it by hand: manual edits will be rejected.
  To change it, edit the rule's entry in scripts/rule-sources.ts (description, sources,
  opt-in reason) or the fixture and cases in test/cases.ts, then run `npm run build`
  and `npm run docs` and commit the result. See docs/rule-priority.md.
-->

# `preferUtilExtend`

Use `util.extend(receiver, contributor)` instead of two-argument `Object.assign` (the same behavior, verified).

- **Severity:** warn
- **Presets:** all

## Example

Flagged when this rule alone is enabled:

```js
Object.assign(a, b);
```

Reported as warning: Use util.extend(receiver, contributor) instead of Object.assign(). (`r-util-prefer.js`, line 29).

## Rule source

- Tier 4: [house preference](https://github.com/nemchik/biome-plugin-suitescript/blob/main/docs/rule-priority.md#source-tiers)
- Verified: [util-extend](https://github.com/nemchik/biome-plugin-suitescript/blob/main/docs/verification/results/util-extend.md)

Enable it with `"plugins": ["biome-plugin-suitescript/preferUtilExtend"]` or through a preset. See the [README](https://github.com/nemchik/biome-plugin-suitescript#readme).
