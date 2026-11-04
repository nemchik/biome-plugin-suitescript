<!--
  This page is generated. Do not edit it by hand: manual edits will be rejected.
  To change it, edit the rule's entry in scripts/rule-sources.ts (description, sources,
  opt-in reason) or the fixture and cases in test/cases.ts, then run `npm run build`
  and `npm run docs` and commit the result. See docs/rule-priority.md.
-->

# `noMapReduceSearchResults`

`getInputData` returns the search object, not `getRange()` results.

- **Severity:** warn
- **Presets:** all

## Example

Flagged when this rule alone is enabled:

```js
return rows;
```

Reported as warning: Return the search object from getInputData instead of its results. (`mr-search.js`, line 4).

## Rule source

- Tier 3: [Oracle help: map/reduce best practices](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_0801064715.html)

Enable it with `"plugins": ["biome-plugin-suitescript/noMapReduceSearchResults"]` or through a preset. See the [README](https://github.com/nemchik/biome-plugin-suitescript#readme).
