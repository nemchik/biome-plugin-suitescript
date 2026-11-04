<!--
  This page is generated. Do not edit it by hand: manual edits will be rejected.
  To change it, edit the rule's entry in scripts/rule-sources.ts (description, sources,
  opt-in reason) or the fixture and cases in test/cases.ts, then run `npm run build`
  and `npm run docs` and commit the result. See docs/rule-priority.md.
-->

# `moduleVars`

Conventional identifier per `N/` module (`N/record` → `record`).

- **Severity:** warn
- **Presets:** recommended, all

## Example

Flagged when this rule alone is enabled:

```js
define('named', ['N/log', 'N/bogus', './lib.js', 'N/record', 'N/search'], (log, bogus, lib, rec) => {
```

Reported as warning: Identifier for N/record should be 'record'. (`bad.js`, line 1).

## Rule source

- Tier 4: [acdvs `module-vars`](https://github.com/acdvs/eslint-plugin-suitescript/blob/master/lib/rules/module-vars.ts)
- Tier 4: [btonasse `module-vars`](https://github.com/btonasse/eslint-plugin-suitescript/blob/master/lib/rules/module-vars.js)

Enable it with `"plugins": ["biome-plugin-suitescript/moduleVars"]` or through a preset. See the [README](https://github.com/nemchik/biome-plugin-suitescript#readme).
