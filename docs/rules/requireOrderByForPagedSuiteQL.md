<!--
  This page is generated. Do not edit it by hand: manual edits will be rejected.
  To change it, edit the rule's entry in scripts/rule-sources.ts (description, sources,
  opt-in reason) or the fixture and cases in test/cases.ts, then run `npm run build`
  and `npm run docs` and commit the result. See docs/rule-priority.md.
-->

# `requireOrderByForPagedSuiteQL`

A literal `runSuiteQLPaged` query has an `ORDER BY`.

- **Severity:** warn
- **Presets:** recommended, all

## Example

Flagged when this rule alone is enabled:

```js
query.runSuiteQLPaged({ query: 'SELECT id FROM customer', pageSize: 50 });
```

Reported as warning: A paged SuiteQL query needs an ORDER BY to avoid duplicate or missing results. (`r-server.js`, line 18).

## Rule source

- Tier 3: [Oracle help: query.runSuiteQLPaged](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_157960586441.html)

Enable it with `"plugins": ["biome-plugin-suitescript/requireOrderByForPagedSuiteQL"]` or through a preset. See the [README](https://github.com/nemchik/biome-plugin-suitescript#readme).
