<!--
  This page is generated. Do not edit it by hand: manual edits will be rejected.
  To change it, edit the rule's entry in scripts/rule-sources.ts (description, sources,
  opt-in reason) or the fixture and cases in test/cases.ts, then run `npm run build`
  and `npm run docs` and commit the result. See docs/rule-priority.md.
-->

# `noExtraDeps`

More dependencies than callback parameters (the extra modules load but are unused).

- **Severity:** warn
- **Presets:** minimal, recommended, all

## Example

Flagged when this rule alone is enabled:

```js
define(['N/record', 'N/search'], (record) => record);
```

Reported as warning: Excess module name 'N/search'. (`define-shapes.js`, line 10).

## Rule source

- Tier 4: [btonasse `no-extra-modules`](https://github.com/btonasse/eslint-plugin-suitescript/blob/master/lib/rules/no-extra-modules.js)
- Tier 4: [amd `no-extra-deps`](https://github.com/acdvs/eslint-plugin-amd/blob/main/lib/rules/no-extra-deps.ts)

Enable it with `"plugins": ["biome-plugin-suitescript/noExtraDeps"]` or through a preset. See the [README](https://github.com/nemchik/biome-plugin-suitescript#readme).
