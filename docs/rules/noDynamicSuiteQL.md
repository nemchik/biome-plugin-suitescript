<!--
  This page is generated. Do not edit it by hand: manual edits will be rejected.
  To change it, edit the rule's entry in scripts/rule-sources.ts (description, sources,
  opt-in reason) or the fixture and cases in test/cases.ts, then run `npm run build`
  and `npm run docs` and commit the result. See docs/rule-priority.md.
-->

# `noDynamicSuiteQL`

`runSuiteQL` queries use `?` placeholders, not concatenation or template literals (calls that pass `params` are skipped).

- **Severity:** warn
- **Presets:** recommended, all

## Example

Flagged when this rule alone is enabled:

```js
query.runSuiteQL({ query: `SELECT id FROM customer WHERE id = ${id}` });
```

Reported as warning: Build SuiteQL with ? placeholders and params, not string concatenation. (`r-suiteql.js`, line 4).

## Rule source

- Tier 1: [OWASP skill](https://github.com/nemchik/biome-plugin-suitescript/blob/main/.agents/skills/netsuite-owasp-secure-coding/SKILL.md)

Enable it with `"plugins": ["biome-plugin-suitescript/noDynamicSuiteQL"]` or through a preset. See the [README](https://github.com/nemchik/biome-plugin-suitescript#readme).
