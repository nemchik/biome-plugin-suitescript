<!--
  This page is generated. Do not edit it by hand: manual edits will be rejected.
  To change it, edit the rule's entry in scripts/rule-sources.ts (description, sources,
  opt-in reason) or the fixture and cases in test/cases.ts, then run `npm run build`
  and `npm run docs` and commit the result. See docs/rule-priority.md.
-->

# `noServerConsole`

`console` output goes nowhere in server scripts; use `log.*` (`console` is for client scripts, so Biome's native `noConsole`, which cannot tell them apart, does not fit alongside this rule).

- **Severity:** warn
- **Presets:** all

## Example

Flagged when this rule alone is enabled:

```js
console.log('a');
```

Reported as warning: console.log() output goes nowhere in server scripts; use log.debug() instead. (`noServerConsole.js`, line 3).

## Rule source

- Tier 1: [SAFE guide](https://github.com/nemchik/biome-plugin-suitescript/blob/main/.agents/skills/netsuite-sdf-safe-guide/quick-reference.md)

Enable it with `"plugins": ["biome-plugin-suitescript/noServerConsole"]` or through a preset. See the [README](https://github.com/nemchik/biome-plugin-suitescript#readme).
