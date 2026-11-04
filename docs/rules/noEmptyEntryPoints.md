<!--
  This page is generated. Do not edit it by hand: manual edits will be rejected.
  To change it, edit the rule's entry in scripts/rule-sources.ts (description, sources,
  opt-in reason) or the fixture and cases in test/cases.ts, then run `npm run build`
  and `npm run docs` and commit the result. See docs/rule-priority.md.
-->

# `noEmptyEntryPoints`

A returned entry point with an empty body.

- **Severity:** warn
- **Presets:** recommended, all

## Example

Flagged when this rule alone is enabled:

```js
define(["N/record"], (record) => ({ execute() {} }));
```

Reported as warning: Entry point 'execute' is empty. (`tags-bad.js`, line 5).

## Rule source

- Tier 3: [Oracle help: script architecture](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/subsect_0804042112.html)

Enable it with `"plugins": ["biome-plugin-suitescript/noEmptyEntryPoints"]` or through a preset. See the [README](https://github.com/nemchik/biome-plugin-suitescript#readme).
