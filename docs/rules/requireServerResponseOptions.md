<!--
  This page is generated. Do not edit it by hand: manual edits will be rejected.
  To change it, edit the rule's entry in scripts/rule-sources.ts (description, sources,
  opt-in reason) or the fixture and cases in test/cases.ts, then run `npm run build`
  and `npm run docs` and commit the result. See docs/rule-priority.md.
-->

# `requireServerResponseOptions`

Required `response.setHeader`/`write`/`writeFile`/... options are present.

- **Severity:** error
- **Presets:** recommended, all

## Example

Flagged when this rule alone is enabled:

```js
context.response.setHeader({ name: 'X-Missing' });
```

Reported as error: setHeader() needs the 'value' option. (`r-server.js`, line 10).

## Rule source

- Tier 2: [headintheclouddev `N/http`](https://github.com/headintheclouddev/typings-suitescript-2.0/blob/master/N/http.d.ts)
- Tier 3: [Oracle help: ServerResponse](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_4567652689.html)

Enable it with `"plugins": ["biome-plugin-suitescript/requireServerResponseOptions"]` or through a preset. See the [README](https://github.com/nemchik/biome-plugin-suitescript#readme).
