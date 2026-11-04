<!--
  This page is generated. Do not edit it by hand: manual edits will be rejected.
  To change it, edit the rule's entry in scripts/rule-sources.ts (description, sources,
  opt-in reason) or the fixture and cases in test/cases.ts, then run `npm run build`
  and `npm run docs` and commit the result. See docs/rule-priority.md.
-->

# `requireServerWidgetOptions`

Required `addField`/`addButton`/`addSublist`/`addColumn`/... options (`id`, `label`, `type`, ...) are present.

- **Severity:** error
- **Presets:** recommended, all

## Example

Flagged when this rule alone is enabled:

```js
form.addField({ id: 'custpage_a', label: 'A' });
```

Reported as error: addField() needs the 'type' option. (`r-server.js`, line 29).

## Rule source

- Tier 2: [headintheclouddev `N/ui/serverWidget`](https://github.com/headintheclouddev/typings-suitescript-2.0/blob/master/N/ui/serverWidget.d.ts)
- Tier 3: [Oracle help: N/ui/serverWidget](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_4321345532.html)

Enable it with `"plugins": ["biome-plugin-suitescript/requireServerWidgetOptions"]` or through a preset. See the [README](https://github.com/nemchik/biome-plugin-suitescript#readme).
