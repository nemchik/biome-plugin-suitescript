<!--
  This page is generated. Do not edit it by hand: manual edits will be rejected.
  To change it, edit the rule's entry in scripts/rule-sources.ts (description, sources,
  opt-in reason) or the fixture and cases in test/cases.ts, then run `npm run build`
  and `npm run docs` and commit the result. See docs/rule-priority.md.
-->

# `requireQueryOptions`

Required `createColumn`/`createCondition`/`createSort` options (`fieldId` or `formula`, `type` with `formula`, ...) are present.

- **Severity:** error
- **Presets:** recommended, all

## Example

Flagged when this rule alone is enabled:

```js
query.createColumn({ formula: 'x' });
```

Reported as error: createColumn() needs the 'type' option when it uses 'formula'. (`r-server.js`, line 33).

## Rule source

- Tier 2: [headintheclouddev `N/query`](https://github.com/headintheclouddev/typings-suitescript-2.0/blob/master/N/query.d.ts)
- Tier 3: [Oracle help: Query.createColumn](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_1510780373.html)

Enable it with `"plugins": ["biome-plugin-suitescript/requireQueryOptions"]` or through a preset. See the [README](https://github.com/nemchik/biome-plugin-suitescript#readme).
