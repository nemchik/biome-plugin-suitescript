<!--
  This page is generated. Do not edit it by hand: manual edits will be rejected.
  To change it, edit the rule's entry in scripts/rule-sources.ts (description, sources,
  opt-in reason) or the fixture and cases in test/cases.ts, then run `npm run build`
  and `npm run docs` and commit the result. See docs/rule-priority.md.
-->

# `noUnsupportedServerWidgetFieldType`

No `DATETIME` in `addField` and no unsupported type in `List.addColumn`.

- **Severity:** error
- **Presets:** recommended, all

## Example

Flagged when this rule alone is enabled:

```js
form.addField({ id: 'custpage_c', label: 'C', type: serverWidget.FieldType.DATETIME });
```

Reported as error: DATETIME is not supported by addField; use DATETIMETZ. (`r-server.js`, line 31).

## Rule source

- Tier 2: [headintheclouddev `N/ui/serverWidget`](https://github.com/headintheclouddev/typings-suitescript-2.0/blob/master/N/ui/serverWidget.d.ts)
- Tier 3: [Oracle help: serverWidget.FieldType](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_4332671056.html)

Enable it with `"plugins": ["biome-plugin-suitescript/noUnsupportedServerWidgetFieldType"]` or through a preset. See the [README](https://github.com/nemchik/biome-plugin-suitescript#readme).
