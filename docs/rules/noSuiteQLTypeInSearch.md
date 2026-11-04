<!--
  This page is generated. Do not edit it by hand: manual edits will be rejected.
  To change it, edit the rule's entry in scripts/rule-sources.ts (description, sources,
  opt-in reason) or the fixture and cases in test/cases.ts, then run `npm run build`
  and `npm run docs` and commit the result. See docs/rule-priority.md.
-->

# `noSuiteQLTypeInSearch`

No SuiteQL abbreviation (`PurchOrd`) as the `type` of `search.create`.

- **Severity:** error
- **Presets:** recommended, all

## Example

Flagged when this rule alone is enabled:

```js
search.create({ type: 'PurchOrd' });
```

Reported as error: 'PurchOrd' is a SuiteQL abbreviation, not a search type; use search.Type. (`r-server.js`, line 20).

## Rule source

- Tier 1: [SAFE guide](https://github.com/nemchik/biome-plugin-suitescript/blob/main/.agents/skills/netsuite-sdf-safe-guide/SKILL.md)

Enable it with `"plugins": ["biome-plugin-suitescript/noSuiteQLTypeInSearch"]` or through a preset. See the [README](https://github.com/nemchik/biome-plugin-suitescript#readme).
