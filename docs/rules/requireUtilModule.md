<!--
  This page is generated. Do not edit it by hand: manual edits will be rejected.
  To change it, edit the rule's entry in scripts/rule-sources.ts (description, sources,
  opt-in reason) or the fixture and cases in test/cases.ts, then run `npm run build`
  and `npm run docs` and commit the result. See docs/rule-priority.md.
-->

# `requireUtilModule`

A used `util.*` needs `N/util` loaded (the upgrade skill recommends it for `log`; the global needs no loading).

- **Severity:** warn
- **Presets:** all

## Example

Flagged when this rule alone is enabled:

```js
util.isArray([]);
```

Reported as warning: 'util' is used but N/util is not loaded. (`r-util.js`, line 3).

## Rule source

- Tier 1: [upgrade skill (conversion guide)](https://github.com/nemchik/biome-plugin-suitescript/blob/main/.agents/skills/netsuite-suitescript-upgrade/references/conversion-guide.md)

Enable it with `"plugins": ["biome-plugin-suitescript/requireUtilModule"]` or through a preset. See the [README](https://github.com/nemchik/biome-plugin-suitescript#readme).
