<!--
  This page is generated. Do not edit it by hand: manual edits will be rejected.
  To change it, edit the rule's entry in scripts/rule-sources.ts (description, sources,
  opt-in reason) or the fixture and cases in test/cases.ts, then run `npm run build`
  and `npm run docs` and commit the result. See docs/rule-priority.md.
-->

# `noMultipleDefine`

A script calls `define()` only once.

- **Severity:** error
- **Presets:** recommended, all

## Example

Flagged when this rule alone is enabled:

```js
define(['N/search'], (search) => search);
```

Reported as error: A script can call define() only once. (`r-defines.js`, line 4).

## Rule source

- Tier 3: [Oracle help: entry point validation](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/chapter_4527904430.html)
- Tier 3: [Oracle help: validation errors](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_4503568059.html)

Enable it with `"plugins": ["biome-plugin-suitescript/noMultipleDefine"]` or through a preset. See the [README](https://github.com/nemchik/biome-plugin-suitescript#readme).
