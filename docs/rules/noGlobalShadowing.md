<!--
  This page is generated. Do not edit it by hand: manual edits will be rejected.
  To change it, edit the rule's entry in scripts/rule-sources.ts (description, sources,
  opt-in reason) or the fixture and cases in test/cases.ts, then run `npm run build`
  and `npm run docs` and commit the result. See docs/rule-priority.md.
-->

# `noGlobalShadowing`

No variable named `log` or `util` other than the N/log, N/util module itself.

- **Severity:** error
- **Presets:** recommended, all

## Example

Flagged when this rule alone is enabled:

```js
const log = 1;
```

Reported as error: 'log' shadows the global log. (`r-amd.js`, line 3).

## Rule source

- Tier 1: [upgrade skill](https://github.com/nemchik/biome-plugin-suitescript/blob/main/.agents/skills/netsuite-suitescript-upgrade/SKILL.md)

Enable it with `"plugins": ["biome-plugin-suitescript/noGlobalShadowing"]` or through a preset. See the [README](https://github.com/nemchik/biome-plugin-suitescript#readme).
