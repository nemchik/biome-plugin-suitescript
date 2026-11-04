<!--
  This page is generated. Do not edit it by hand: manual edits will be rejected.
  To change it, edit the rule's entry in scripts/rule-sources.ts (description, sources,
  opt-in reason) or the fixture and cases in test/cases.ts, then run `npm run build`
  and `npm run docs` and commit the result. See docs/rule-priority.md.
-->

# `noModuleScopeApiCalls`

No `N/` API calls while the `define` callback runs; initialize from entry points (calls that only build an object, `createColumn`, `createFilter`, `createSort` and `createSetting`, are skipped).

- **Severity:** error
- **Presets:** recommended, all

## Example

Flagged when this rule alone is enabled:

```js
const loaded = record.load({ type: 'x', id: 1 });
```

Reported as error: record.load() runs at module scope; call it from an entry point. (`r-factories.js`, line 3).

## Rule source

- Tier 1: [SAFE guide](https://github.com/nemchik/biome-plugin-suitescript/blob/main/.agents/skills/netsuite-sdf-safe-guide/SKILL.md)

Enable it with `"plugins": ["biome-plugin-suitescript/noModuleScopeApiCalls"]` or through a preset. See the [README](https://github.com/nemchik/biome-plugin-suitescript#readme).
