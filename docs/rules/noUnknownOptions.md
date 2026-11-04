<!--
  This page is generated. Do not edit it by hand: manual edits will be rejected.
  To change it, edit the rule's entry in scripts/rule-sources.ts (description, sources,
  opt-in reason) or the fixture and cases in test/cases.ts, then run `npm run build`
  and `npm run docs` and commit the result. See docs/rule-priority.md.
-->

# `noUnknownOptions`

No option the type definitions do not list for a module function (`record.load({ typ: 'x' })`).

- **Severity:** warn
- **Presets:** all

## Example

Flagged when this rule alone is enabled:

```js
record.load({ id: 1, type: 'customer', foo: 1 });
```

Reported as warning: record.load() does not take an 'foo' option. (`r-typings.js`, line 5).

## Rule source

- Tier 2: [headintheclouddev `N/*`](https://github.com/headintheclouddev/typings-suitescript-2.0/tree/master/N)

Enable it with `"plugins": ["biome-plugin-suitescript/noUnknownOptions"]` or through a preset. See the [README](https://github.com/nemchik/biome-plugin-suitescript#readme).
