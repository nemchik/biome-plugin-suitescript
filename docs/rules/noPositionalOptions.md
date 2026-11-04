<!--
  This page is generated. Do not edit it by hand: manual edits will be rejected.
  To change it, edit the rule's entry in scripts/rule-sources.ts (description, sources,
  opt-in reason) or the fixture and cases in test/cases.ts, then run `npm run build`
  and `npm run docs` and commit the result. See docs/rule-priority.md.
-->

# `noPositionalOptions`

No literal passed where a module function takes an options object (`record.load('customer', 1)`).

- **Severity:** error
- **Presets:** recommended, all

## Example

Flagged when this rule alone is enabled:

```js
record.load('customer', 1);
```

Reported as error: record.load() takes an options object, not positional arguments. (`r-typings.js`, line 6).

## Rule source

- Tier 2: [headintheclouddev `N/*`](https://github.com/headintheclouddev/typings-suitescript-2.0/tree/master/N)

Enable it with `"plugins": ["biome-plugin-suitescript/noPositionalOptions"]` or through a preset. See the [README](https://github.com/nemchik/biome-plugin-suitescript#readme).
