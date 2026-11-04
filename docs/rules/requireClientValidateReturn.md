<!--
  This page is generated. Do not edit it by hand: manual edits will be rejected.
  To change it, edit the rule's entry in scripts/rule-sources.ts (description, sources,
  opt-in reason) or the fixture and cases in test/cases.ts, then run `npm run build`
  and `npm run docs` and commit the result. See docs/rule-priority.md.
-->

# `requireClientValidateReturn`

`saveRecord` and `validate*` return a value (only a body with no `return <value>` is flagged).

- **Severity:** warn
- **Presets:** recommended, all

## Example

Flagged when this rule alone is enabled:

```js
const saveRecord = () => {
```

Reported as warning: 'saveRecord' must return true or false. (`client-validate.js`, line 5).

## Rule source

- Tier 3: [Oracle help: saveRecord](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_4410693749.html)
- Tier 3: [Oracle help: validateField](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_4410693152.html)

Enable it with `"plugins": ["biome-plugin-suitescript/requireClientValidateReturn"]` or through a preset. See the [README](https://github.com/nemchik/biome-plugin-suitescript#readme).
