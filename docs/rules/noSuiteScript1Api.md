<!--
  This page is generated. Do not edit it by hand: manual edits will be rejected.
  To change it, edit the rule's entry in scripts/rule-sources.ts (description, sources,
  opt-in reason) or the fixture and cases in test/cases.ts, then run `npm run build`
  and `npm run docs` and commit the result. See docs/rule-priority.md.
-->

# `noSuiteScript1Api`

No `nlapi*`/`nlobj*` or 1.0-only methods (`getFieldValue`, `getLineItemValue`, `e.getCode()`).

- **Severity:** error
- **Presets:** recommended, all

## Example

Flagged when this rule alone is enabled:

```js
window.nlapiLoadRecord('x', 1);
```

Reported as error: 'nlapiLoadRecord' is SuiteScript 1.0; use the SuiteScript 2.1 N/ modules. (`r-old-api.js`, line 3).

## Rule source

- Tier 1: [upgrade skill](https://github.com/nemchik/biome-plugin-suitescript/blob/main/.agents/skills/netsuite-suitescript-upgrade/SKILL.md)

Enable it with `"plugins": ["biome-plugin-suitescript/noSuiteScript1Api"]` or through a preset. See the [README](https://github.com/nemchik/biome-plugin-suitescript#readme).
