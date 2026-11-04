<!--
  This page is generated. Do not edit it by hand: manual edits will be rejected.
  To change it, edit the rule's entry in scripts/rule-sources.ts (description, sources,
  opt-in reason) or the fixture and cases in test/cases.ts, then run `npm run build`
  and `npm run docs` and commit the result. See docs/rule-priority.md.
-->

# `noSecretKeyGuidAndSecret`

`https.createSecretKey` takes `guid` or `secret`, not both.

- **Severity:** error
- **Presets:** recommended, all

## Example

Flagged when this rule alone is enabled:

```js
https.createSecretKey({ guid: g, secret: s });
```

Reported as error: Pass createSecretKey() either 'guid' or 'secret', not both. (`r-server.js`, line 49).

## Rule source

- Tier 2: [headintheclouddev `N/https`](https://github.com/headintheclouddev/typings-suitescript-2.0/blob/master/N/https.d.ts)
- Tier 3: [Oracle help: https.createSecretKey](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_4418247967.html)

Enable it with `"plugins": ["biome-plugin-suitescript/noSecretKeyGuidAndSecret"]` or through a preset. See the [README](https://github.com/nemchik/biome-plugin-suitescript#readme).
