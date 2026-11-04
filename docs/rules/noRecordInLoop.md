<!--
  This page is generated. Do not edit it by hand: manual edits will be rejected.
  To change it, edit the rule's entry in scripts/rule-sources.ts (description, sources,
  opt-in reason) or the fixture and cases in test/cases.ts, then run `npm run build`
  and `npm run docs` and commit the result. See docs/rule-priority.md.
-->

# `noRecordInLoop`

No `record.load`, `query.runSuiteQL` or `search.create` inside loops or `forEach`/`each`/`map` callbacks.

- **Severity:** warn
- **Presets:** all

## Example

Flagged when this rule alone is enabled:

```js
record.load({ type: 'x', id });
```

Reported as warning: record.load() inside a loop; fetch what you need with one search or query instead. (`r-loops.js`, line 4).

## Rule source

- Tier 1: [SAFE guide](https://github.com/nemchik/biome-plugin-suitescript/blob/main/.agents/skills/netsuite-sdf-safe-guide/SKILL.md)

Enable it with `"plugins": ["biome-plugin-suitescript/noRecordInLoop"]` or through a preset. See the [README](https://github.com/nemchik/biome-plugin-suitescript#readme).
