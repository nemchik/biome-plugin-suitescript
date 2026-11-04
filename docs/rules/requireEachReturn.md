<!--
  This page is generated. Do not edit it by hand: manual edits will be rejected.
  To change it, edit the rule's entry in scripts/rule-sources.ts (description, sources,
  opt-in reason) or the fixture and cases in test/cases.ts, then run `npm run build`
  and `npm run docs` and commit the result. See docs/rule-priority.md.
-->

# `requireEachReturn`

A `.run().each` or `.iterator().each` callback returns a value (`true` to continue).

- **Severity:** warn
- **Presets:** recommended, all

## Example

Flagged when this rule alone is enabled:

```js
search.run().each((r) => {
```

Reported as warning: The each() callback must return true to continue to the next row. (`r-server.js`, line 51).

## Rule source

- Tier 1: [upgrade skill](https://github.com/nemchik/biome-plugin-suitescript/blob/main/.agents/skills/netsuite-suitescript-upgrade/SKILL.md)
- Tier 1: [learning skill](https://github.com/nemchik/biome-plugin-suitescript/blob/main/.agents/skills/netsuite-suitescript-learning/SKILL.md)

Enable it with `"plugins": ["biome-plugin-suitescript/requireEachReturn"]` or through a preset. See the [README](https://github.com/nemchik/biome-plugin-suitescript#readme).
