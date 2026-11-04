<!--
  This page is generated. Do not edit it by hand: manual edits will be rejected.
  To change it, edit the rule's entry in scripts/rule-sources.ts (description, sources,
  opt-in reason) or the fixture and cases in test/cases.ts, then run `npm run build`
  and `npm run docs` and commit the result. See docs/rule-priority.md.
-->

# `noBlockedResponseHeader`

No header NetSuite blocks on a Suitelet response (`Location`, `Server`, `Date`, ...).

- **Severity:** error
- **Presets:** recommended, all

## Example

Flagged when this rule alone is enabled:

```js
context.response.setHeader({ name: 'Location', value: target });
```

Reported as error: A Suitelet cannot set the location header; NetSuite throws SSS_INVALID_HEADER. (`r-server.js`, line 7).

## Rule source

- Tier 3: [Oracle help: N/https](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_4418229131.html)

Enable it with `"plugins": ["biome-plugin-suitescript/noBlockedResponseHeader"]` or through a preset. See the [README](https://github.com/nemchik/biome-plugin-suitescript#readme).
