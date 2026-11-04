<!--
  This page is generated. Do not edit it by hand: manual edits will be rejected.
  To change it, edit the rule's entry in scripts/rule-sources.ts (description, sources,
  opt-in reason) or the fixture and cases in test/cases.ts, then run `npm run build`
  and `npm run docs` and commit the result. See docs/rule-priority.md.
-->

# `noMissingModules`

A module used (`record.load()`) must be loaded in `define`/`import` (`log` and `util` are globals).

- **Severity:** error
- **Presets:** recommended, all

## Example

Flagged when this rule alone is enabled:

```js
email.send({});
```

Reported as error: 'email' is used but N/email is not loaded. (`skills-bad.js`, line 6).

## Rule source

- Tier 0: [ADR 0006](https://github.com/nemchik/biome-plugin-suitescript/blob/main/docs/adr/0006-log-is-a-global-with-two-opposite-styles.md)
- Tier 1: [upgrade skill](https://github.com/nemchik/biome-plugin-suitescript/blob/main/.agents/skills/netsuite-suitescript-upgrade/SKILL.md)
- Tier 1: [learning skill](https://github.com/nemchik/biome-plugin-suitescript/blob/main/.agents/skills/netsuite-suitescript-learning/SKILL.md)

Enable it with `"plugins": ["biome-plugin-suitescript/noMissingModules"]` or through a preset. See the [README](https://github.com/nemchik/biome-plugin-suitescript#readme).
