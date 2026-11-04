<!--
  This page is generated. Do not edit it by hand: manual edits will be rejected.
  To change it, edit the rule's entry in scripts/rule-sources.ts (description, sources,
  opt-in reason) or the fixture and cases in test/cases.ts, then run `npm run build`
  and `npm run docs` and commit the result. See docs/rule-priority.md.
-->

# `noQueryColumnFieldAndFormula`

A query column cannot set both `fieldId` and `formula`.

- **Severity:** error
- **Presets:** recommended, all

## Example

Flagged when this rule alone is enabled:

```js
query.createColumn({ fieldId: 'id', formula: 'x' });
```

Reported as error: A query column cannot set both fieldId and formula. (`pages-bad.js`, line 9).

## Rule source

- Tier 3: [Oracle help: Column.fieldId](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_1510788976.html)
- Tier 3: [Oracle help: Column.formula](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_1510789062.html)

Enable it with `"plugins": ["biome-plugin-suitescript/noQueryColumnFieldAndFormula"]` or through a preset. See the [README](https://github.com/nemchik/biome-plugin-suitescript#readme).
