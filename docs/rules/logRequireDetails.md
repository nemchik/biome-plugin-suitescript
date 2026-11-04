<!--
  This page is generated. Do not edit it by hand: manual edits will be rejected.
  To change it, edit the rule's entry in scripts/rule-sources.ts (description, sources,
  opt-in reason) or the fixture and cases in test/cases.ts, then run `npm run build`
  and `npm run docs` and commit the result. See docs/rule-priority.md.
-->

# `logRequireDetails`

...needs `details` (Oracle marks it optional, so this house style is in `all` only).

- **Severity:** warn
- **Presets:** all

## Example

Flagged when this rule alone is enabled:

```js
log.debug('only details');
```

Reported as warning: Log details are required with 'log.debug'. (`bad.js`, line 2).

## Rule source

- Tier 0: [ADR 0002](https://github.com/nemchik/biome-plugin-suitescript/blob/main/docs/adr/0002-options-are-separate-rules.md)
- Tier 4: [acdvs `log-args`](https://github.com/acdvs/eslint-plugin-suitescript/blob/master/lib/rules/log-args.ts)
- Tier 4: [btonasse `log-args`](https://github.com/btonasse/eslint-plugin-suitescript/blob/master/lib/rules/log-args.js)

Enable it with `"plugins": ["biome-plugin-suitescript/logRequireDetails"]` or through a preset. See the [README](https://github.com/nemchik/biome-plugin-suitescript#readme).
