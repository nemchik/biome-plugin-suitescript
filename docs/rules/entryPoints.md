<!--
  This page is generated. Do not edit it by hand: manual edits will be rejected.
  To change it, edit the rule's entry in scripts/rule-sources.ts (description, sources,
  opt-in reason) or the fixture and cases in test/cases.ts, then run `npm run build`
  and `npm run docs` and commit the result. See docs/rule-priority.md.
-->

# `entryPoints`

Returned entry points must belong to one script type and include its required ones.

- **Severity:** error
- **Presets:** recommended, all

## Example

Flagged when this rule alone is enabled:

```js
define(['N/search'], (search) => ({ getInputData() { return 1; } }));
```

Reported as error: MapReduceScript requires entry point map or reduce. (`mr-missing.js`, line 1).

## Rule source

- Tier 3: [Oracle help: entry point validation](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/chapter_4527904430.html)
- Tier 3: [Oracle help: validation errors](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_4503568059.html)
- Tier 4: [acdvs `entry-points`](https://github.com/acdvs/eslint-plugin-suitescript/blob/master/lib/rules/entry-points.ts)
- Tier 4: [btonasse `entry-points`](https://github.com/btonasse/eslint-plugin-suitescript/blob/master/lib/rules/entry-points.js)

Enable it with `"plugins": ["biome-plugin-suitescript/entryPoints"]` or through a preset. See the [README](https://github.com/nemchik/biome-plugin-suitescript#readme).
