<!--
  This page is generated. Do not edit it by hand: manual edits will be rejected.
  To change it, edit the rule's entry in scripts/rule-sources.ts (description, sources,
  opt-in reason) or the fixture and cases in test/cases.ts, then run `npm run build`
  and `npm run docs` and commit the result. See docs/rule-priority.md.
-->

# `noLogModule`

Opt-in style: use the global `log`, not `N/log` (the opposite of `requireLogModule`).

- **Severity:** warn
- **Presets:** none (opt-in)
- **Opt-in:** the opposite style to `requireLogModule`; enable only one

## Example

Flagged when this rule alone is enabled:

```js
define('named', ['N/log', 'N/bogus', './lib.js', 'N/record', 'N/search'], (log, bogus, lib, rec) => {
```

Reported as warning: Use global log instead of the N/log module. (`bad.js`, line 1).

## Rule source

- Tier 0: [ADR 0005](https://github.com/nemchik/biome-plugin-suitescript/blob/main/docs/adr/0005-guessing-rules-are-in-no-preset.md)
- Tier 0: [ADR 0006](https://github.com/nemchik/biome-plugin-suitescript/blob/main/docs/adr/0006-suitescript-globals-have-two-opposite-loading-styles.md)
- Tier 3: [Oracle help: log object](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_4387812838.html)
- Tier 4: [acdvs `no-log-module`](https://github.com/acdvs/eslint-plugin-suitescript/blob/master/lib/rules/no-log-module.ts)
- Tier 4: [btonasse `no-log-module`](https://github.com/btonasse/eslint-plugin-suitescript/blob/master/lib/rules/no-log-module.js)

Enable it with `"plugins": ["biome-plugin-suitescript/noLogModule"]` or through a preset. See the [README](https://github.com/nemchik/biome-plugin-suitescript#readme).
