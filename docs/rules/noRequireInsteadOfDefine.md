<!--
  This page is generated. Do not edit it by hand: manual edits will be rejected.
  To change it, edit the rule's entry in scripts/rule-sources.ts (description, sources,
  opt-in reason) or the fixture and cases in test/cases.ts, then run `npm run build`
  and `npm run docs` and commit the result. See docs/rule-priority.md.
-->

# `noRequireInsteadOfDefine`

A script uses `define()`, not a top-level `require([...], cb)`.

- **Severity:** error
- **Presets:** recommended, all

## Example

Flagged when this rule alone is enabled:

```js
require(['N/record'], (record) => {
```

Reported as error: Use define() instead of require(); NetSuite rejects an entry point script without a define call. (`require-only.js`, line 1).

## Rule source

- Tier 3: [Oracle help: invalid script example](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_4527901694.html)

Enable it with `"plugins": ["biome-plugin-suitescript/noRequireInsteadOfDefine"]` or through a preset. See the [README](https://github.com/nemchik/biome-plugin-suitescript#readme).
