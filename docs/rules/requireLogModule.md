<!--
  This page is generated. Do not edit it by hand: manual edits will be rejected.
  To change it, edit the rule's entry in scripts/rule-sources.ts (description, sources,
  opt-in reason) or the fixture and cases in test/cases.ts, then run `npm run build`
  and `npm run docs` and commit the result. See docs/rule-priority.md.
-->

# `requireLogModule`

A used `log.*` needs `N/log` loaded (the upgrade skill recommends it; the global needs no loading).

- **Severity:** warn
- **Presets:** all

## Example

Flagged when this rule alone is enabled:

```js
log.debug('t', 'd');
```

Reported as warning: 'log' is used but N/log is not loaded. (`r-log.js`, line 3).

## Rule source

- Tier 0: [ADR 0006](https://github.com/nemchik/biome-plugin-suitescript/blob/main/docs/adr/0006-log-is-a-global-with-two-opposite-styles.md)
- Tier 1: [upgrade skill](https://github.com/nemchik/biome-plugin-suitescript/blob/main/.agents/skills/netsuite-suitescript-upgrade/SKILL.md)
- Tier 1: [learning skill](https://github.com/nemchik/biome-plugin-suitescript/blob/main/.agents/skills/netsuite-suitescript-learning/SKILL.md)

Enable it with `"plugins": ["biome-plugin-suitescript/requireLogModule"]` or through a preset. See the [README](https://github.com/nemchik/biome-plugin-suitescript#readme).
