<!--
  This page is generated. Do not edit it by hand: manual edits will be rejected.
  To change it, edit the rule's entry in scripts/rule-sources.ts (description, sources,
  opt-in reason) or the fixture and cases in test/cases.ts, then run `npm run build`
  and `npm run docs` and commit the result. See docs/rule-priority.md.
-->

# `noWrongScriptTypeModules`

No client-only module (`N/currentRecord`, `N/ui/dialog`) in a server script, or a server-only one in a client script.

- **Severity:** error
- **Presets:** recommended, all

## Example

Flagged when this rule alone is enabled:

```js
define(['N/currentRecord', 'N/ui/dialog', 'N/record'], (currentRecord, dialog, record) => {
```

Reported as error: N/currentRecord is only available in client scripts. (`side-server.js`, line 1).

## Rule source

- Tier 3: [Oracle help: SuiteScript 2.1 modules](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/chapter_4220488571.html)

Enable it with `"plugins": ["biome-plugin-suitescript/noWrongScriptTypeModules"]` or through a preset. See the [README](https://github.com/nemchik/biome-plugin-suitescript#readme).
