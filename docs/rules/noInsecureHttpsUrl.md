<!--
  This page is generated. Do not edit it by hand: manual edits will be rejected.
  To change it, edit the rule's entry in scripts/rule-sources.ts (description, sources,
  opt-in reason) or the fixture and cases in test/cases.ts, then run `npm run build`
  and `npm run docs` and commit the result. See docs/rule-priority.md.
-->

# `noInsecureHttpsUrl`

No `http://` URL passed to `https.*` (N/https refuses plain HTTP).

- **Severity:** error
- **Presets:** recommended, all

## Example

Flagged when this rule alone is enabled:

```js
https.get({ url: 'http://example.com', headers: { X_Custom: '1', 'X-Fine': '2' } });
```

Reported as error: N/https does not allow http:// URLs. (`pages-bad.js`, line 7).

## Rule source

- Tier 3: [Oracle help: N/https](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_4418229131.html)

Enable it with `"plugins": ["biome-plugin-suitescript/noInsecureHttpsUrl"]` or through a preset. See the [README](https://github.com/nemchik/biome-plugin-suitescript#readme).
