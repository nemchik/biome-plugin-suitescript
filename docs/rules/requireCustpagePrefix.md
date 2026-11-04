<!--
  This page is generated. Do not edit it by hand: manual edits will be rejected.
  To change it, edit the rule's entry in scripts/rule-sources.ts (description, sources,
  opt-in reason) or the fixture and cases in test/cases.ts, then run `npm run build`
  and `npm run docs` and commit the result. See docs/rule-priority.md.
-->

# `requireCustpagePrefix`

The `id` of a UI object added to an existing page (`context.form.addField`, ...) starts with `custpage`.

- **Severity:** warn
- **Presets:** recommended, all

## Example

Flagged when this rule alone is enabled:

```js
context.form.addField({ id: 'name', label: 'Name', type: 'text' });
```

Reported as warning: The id of a UI object added to an existing page must start with 'custpage'. (`r-form.js`, line 3).

## Rule source

- Tier 3: [Oracle help: N/ui/serverWidget](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_4321345532.html)

Enable it with `"plugins": ["biome-plugin-suitescript/requireCustpagePrefix"]` or through a preset. See the [README](https://github.com/nemchik/biome-plugin-suitescript#readme).
