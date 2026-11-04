<!--
  This page is generated. Do not edit it by hand: manual edits will be rejected.
  To change it, edit the rule's entry in scripts/rule-sources.ts (description, sources,
  opt-in reason) or the fixture and cases in test/cases.ts, then run `npm run build`
  and `npm run docs` and commit the result. See docs/rule-priority.md.
-->

# `noBlockedHttpsHeader`

No header NetSuite discards from an `https.*` request (`Host`, `Content-Length`, ...).

- **Severity:** warn
- **Presets:** recommended, all

## Example

Flagged when this rule alone is enabled:

```js
https.get({ url: 'https://example.com', headers: { Host: 'x', 'X-Ok': '1' } });
```

Reported as warning: NetSuite discards the Host header set in an N/https request. (`r-server.js`, line 24).

## Rule source

- Tier 3: [Oracle help: N/https](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_4418229131.html)

Enable it with `"plugins": ["biome-plugin-suitescript/noBlockedHttpsHeader"]` or through a preset. See the [README](https://github.com/nemchik/biome-plugin-suitescript#readme).
