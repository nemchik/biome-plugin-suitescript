<!--
  This page is generated. Do not edit it by hand: manual edits will be rejected.
  To change it, edit the rule's entry in scripts/rule-sources.ts (description, sources,
  opt-in reason) or the fixture and cases in test/cases.ts, then run `npm run build`
  and `npm run docs` and commit the result. See docs/rule-priority.md.
-->

# `noAmdName`

No module id as the first `define` argument (fixable).

- **Severity:** error
- **Presets:** recommended, all

## Example

Flagged when this rule alone is enabled:

```js
define('a', 'b', () => {});
```

Reported as error: No AMD module name should be provided. (`define-shapes.js`, line 3).

## Rule source

- Tier 4: [btonasse `no-amd-name`](https://github.com/btonasse/eslint-plugin-suitescript/blob/master/lib/rules/no-amd-name.js)
- Tier 4: [amd `no-name`](https://github.com/acdvs/eslint-plugin-amd/blob/main/lib/rules/no-name.ts)

Enable it with `"plugins": ["biome-plugin-suitescript/noAmdName"]` or through a preset. See the [README](https://github.com/nemchik/biome-plugin-suitescript#readme).
