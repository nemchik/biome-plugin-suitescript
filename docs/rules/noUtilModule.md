<!--
  This page is generated. Do not edit it by hand: manual edits will be rejected.
  To change it, edit the rule's entry in scripts/rule-sources.ts (description, sources,
  opt-in reason) or the fixture and cases in test/cases.ts, then run `npm run build`
  and `npm run docs` and commit the result. See docs/rule-priority.md.
-->

# `noUtilModule`

Opt-in style: use the global `util`, not `N/util` (the opposite of `requireUtilModule`).

- **Severity:** warn
- **Presets:** none (opt-in)
- **Opt-in:** the opposite style to `requireUtilModule`; enable only one

## Example

Flagged when this rule alone is enabled:

```js
define(['N/util'], (util) => {
```

Reported as warning: Use global util instead of the N/util module. (`r-util-module.js`, line 1).

## Rule source

- Tier 3: [Oracle help: util Object](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_4387813290.html)

Enable it with `"plugins": ["biome-plugin-suitescript/noUtilModule"]` or through a preset. See the [README](https://github.com/nemchik/biome-plugin-suitescript#readme).
